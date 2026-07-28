-- Make statistics resets observable by every device and keep soft deletes
-- from being resurrected by stale clients.

alter table profiles
  add column if not exists stats_reset_at timestamptz,
  add column if not exists data_reset_at timestamptz;

alter table revlog
  add column if not exists sync_updated_at timestamptz not null default now();

alter table session_log
  add column if not exists sync_updated_at timestamptz not null default now();

create index if not exists idx_revlog_sync_updated
  on revlog (sync_updated_at, id);

create index if not exists idx_session_log_sync_updated
  on session_log (sync_updated_at, id);

create or replace function reset_statistics()
returns timestamptz
language plpgsql
security invoker
set search_path = public
as $$
declare
  owner_id uuid := auth.uid();
  reset_at timestamptz := clock_timestamp();
begin
  if owner_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from revlog
  where user_id = owner_id;

  delete from session_log
  where user_id = owner_id;

  update card_state
  set
    stability = 0,
    difficulty = 0,
    due = reset_at,
    last_review = null,
    state = 0,
    reps = 0,
    lapses = 0,
    learning_steps = 0,
    updated_at = reset_at
  from cards
  join decks on decks.id = cards.deck_id
  where card_state.card_id = cards.id
    and decks.user_id = owner_id;

  update profiles
  set
    stats_reset_at = reset_at,
    updated_at = reset_at
  where id = owner_id;

  return reset_at;
end;
$$;

revoke all on function reset_statistics() from public;
grant execute on function reset_statistics() to authenticated;

create or replace function reset_all_data()
returns timestamptz
language plpgsql
security invoker
set search_path = public
as $$
declare
  owner_id uuid := auth.uid();
  reset_at timestamptz := clock_timestamp();
begin
  if owner_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from decks
  where user_id = owner_id;

  update profiles
  set
    data_reset_at = reset_at,
    stats_reset_at = reset_at,
    updated_at = reset_at
  where id = owner_id;

  return reset_at;
end;
$$;

revoke all on function reset_all_data() from public;
grant execute on function reset_all_data() to authenticated;

create or replace function preserve_soft_delete_and_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
    and old.deleted_at is not null
    and new.deleted_at is null
  then
    new.deleted_at := old.deleted_at;
  end if;

  new.updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists decks_preserve_soft_delete on decks;
create trigger decks_preserve_soft_delete
  before insert or update on decks
  for each row execute function preserve_soft_delete_and_touch_updated_at();

drop trigger if exists cards_preserve_soft_delete on cards;
create trigger cards_preserve_soft_delete
  before insert or update on cards
  for each row execute function preserve_soft_delete_and_touch_updated_at();

create or replace function inherit_parent_deck_delete()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  parent_deleted_at timestamptz;
begin
  select deleted_at
  into parent_deleted_at
  from decks
  where id = new.deck_id;

  if parent_deleted_at is not null then
    new.deleted_at := coalesce(new.deleted_at, parent_deleted_at);
  end if;

  return new;
end;
$$;

drop trigger if exists cards_inherit_parent_delete on cards;
create trigger cards_inherit_parent_delete
  before insert or update on cards
  for each row execute function inherit_parent_deck_delete();

create or replace function touch_card_state_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists card_state_touch_updated_at on card_state;
create trigger card_state_touch_updated_at
  before insert or update on card_state
  for each row execute function touch_card_state_updated_at();

create or replace function touch_sync_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.sync_updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists revlog_touch_sync_updated_at on revlog;
create trigger revlog_touch_sync_updated_at
  before insert or update on revlog
  for each row execute function touch_sync_updated_at();

drop trigger if exists session_log_touch_sync_updated_at on session_log;
create trigger session_log_touch_sync_updated_at
  before insert or update on session_log
  for each row execute function touch_sync_updated_at();
