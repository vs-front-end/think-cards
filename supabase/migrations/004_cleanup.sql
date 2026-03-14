-- ============================================================
-- 004_cleanup.sql
-- Remove notification fields and push_subscriptions table.
-- Add 'typing' to cards.type check constraint.
-- ============================================================

-- ---- profiles: remove notification columns ----

alter table profiles
  drop column if exists notification_enabled,
  drop column if exists notification_time,
  drop column if exists notification_channel;

-- ---- drop notification_channel enum ----

drop type if exists notification_channel;

-- ---- drop push_subscriptions table ----

drop table if exists push_subscriptions;

-- ---- cards: add 'typing' to type check constraint ----

alter table cards
  drop constraint if exists cards_type_check;

alter table cards
  add constraint cards_type_check check (type in ('basic', 'cloze', 'typing'));
