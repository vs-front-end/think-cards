-- ============================================================
-- 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

-- ============================================================
-- TYPES
-- ============================================================

create type notification_channel as enum ('push', 'email');

-- ============================================================
-- TABLES
-- ============================================================

create table profiles (
  id                    uuid        primary key references auth.users (id) on delete cascade,
  username              text        not null,
  avatar_url            text,
  daily_goal_default    int         not null default 20,
  notification_enabled  boolean     not null default false,
  notification_time     time,
  notification_channel  notification_channel,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table decks (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references profiles (id) on delete cascade,
  name        text        not null,
  parent_id   uuid        references decks (id) on delete set null,
  daily_goal  int         not null default 20,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table cards (
  id          uuid        primary key default gen_random_uuid(),
  deck_id     uuid        not null references decks (id) on delete cascade,
  type        text        not null check (type in ('basic', 'cloze')),
  front       text        not null,
  back        text        not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table card_state (
  id          uuid        primary key default gen_random_uuid(),
  card_id     uuid        not null unique references cards (id) on delete cascade,
  stability   float       not null default 0,
  difficulty  float       not null default 0,
  due         timestamptz not null default now(),
  last_review timestamptz,
  state       int         not null default 0,
  reps        int         not null default 0,
  lapses      int         not null default 0,
  updated_at  timestamptz not null default now()
);

create table revlog (
  id              uuid        primary key default gen_random_uuid(),
  card_id         uuid        not null references cards (id) on delete cascade,
  user_id         uuid        not null references profiles (id) on delete cascade,
  rating          int         not null check (rating between 1 and 4),
  scheduled_days  int         not null,
  elapsed_days    int         not null,
  review_time_ms  int         not null,
  reviewed_at     timestamptz not null default now()
);

create table session_log (
  id              uuid        primary key default gen_random_uuid(),
  deck_id         uuid        not null references decks (id) on delete cascade,
  user_id         uuid        not null references profiles (id) on delete cascade,
  started_at      timestamptz not null default now(),
  ended_at        timestamptz,
  cards_reviewed  int         not null default 0,
  time_elapsed_ms int         not null default 0
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_decks_user_deleted     on decks       (user_id, deleted_at);
create index idx_cards_deck_deleted     on cards       (deck_id, deleted_at);
create index idx_card_state_due_state   on card_state  (due, state);
create index idx_revlog_user_reviewed   on revlog      (user_id, reviewed_at);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles    enable row level security;
alter table decks       enable row level security;
alter table cards       enable row level security;
alter table card_state  enable row level security;
alter table revlog      enable row level security;
alter table session_log enable row level security;

-- ---- profiles ----

create policy "profiles: select own"
  on profiles for select
  using (id = auth.uid());

create policy "profiles: insert own"
  on profiles for insert
  with check (id = auth.uid());

create policy "profiles: update own"
  on profiles for update
  using (id = auth.uid());

create policy "profiles: delete own"
  on profiles for delete
  using (id = auth.uid());

-- ---- decks ----

create policy "decks: select own"
  on decks for select
  using (user_id = auth.uid());

create policy "decks: insert own"
  on decks for insert
  with check (user_id = auth.uid());

create policy "decks: update own"
  on decks for update
  using (user_id = auth.uid());

create policy "decks: delete own"
  on decks for delete
  using (user_id = auth.uid());

-- ---- cards ----

create policy "cards: select own"
  on cards for select
  using (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
        and decks.user_id = auth.uid()
    )
  );

create policy "cards: insert own"
  on cards for insert
  with check (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
        and decks.user_id = auth.uid()
    )
  );

create policy "cards: update own"
  on cards for update
  using (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
        and decks.user_id = auth.uid()
    )
  );

create policy "cards: delete own"
  on cards for delete
  using (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
        and decks.user_id = auth.uid()
    )
  );

-- ---- card_state ----

create policy "card_state: select own"
  on card_state for select
  using (
    exists (
      select 1 from cards
      join decks on decks.id = cards.deck_id
      where cards.id = card_state.card_id
        and decks.user_id = auth.uid()
    )
  );

create policy "card_state: insert own"
  on card_state for insert
  with check (
    exists (
      select 1 from cards
      join decks on decks.id = cards.deck_id
      where cards.id = card_state.card_id
        and decks.user_id = auth.uid()
    )
  );

create policy "card_state: update own"
  on card_state for update
  using (
    exists (
      select 1 from cards
      join decks on decks.id = cards.deck_id
      where cards.id = card_state.card_id
        and decks.user_id = auth.uid()
    )
  );

create policy "card_state: delete own"
  on card_state for delete
  using (
    exists (
      select 1 from cards
      join decks on decks.id = cards.deck_id
      where cards.id = card_state.card_id
        and decks.user_id = auth.uid()
    )
  );

-- ---- revlog ----

create policy "revlog: select own"
  on revlog for select
  using (user_id = auth.uid());

create policy "revlog: insert own"
  on revlog for insert
  with check (user_id = auth.uid());

create policy "revlog: update own"
  on revlog for update
  using (user_id = auth.uid());

create policy "revlog: delete own"
  on revlog for delete
  using (user_id = auth.uid());

-- ---- session_log ----

create policy "session_log: select own"
  on session_log for select
  using (user_id = auth.uid());

create policy "session_log: insert own"
  on session_log for insert
  with check (user_id = auth.uid());

create policy "session_log: update own"
  on session_log for update
  using (user_id = auth.uid());

create policy "session_log: delete own"
  on session_log for delete
  using (user_id = auth.uid());
