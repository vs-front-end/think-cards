-- ============================================================
-- 003_push_subscriptions.sql
-- ============================================================

create table push_subscriptions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references profiles (id) on delete cascade,
  endpoint    text        not null,
  p256dh      text        not null,
  auth        text        not null,
  created_at  timestamptz not null default now(),
  unique (user_id, endpoint)
);

-- ============================================================
-- RLS
-- ============================================================

alter table push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on push_subscriptions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
