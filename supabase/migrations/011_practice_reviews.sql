-- Keep voluntary practice visible in daily activity without feeding it into
-- FSRS retention metrics.

alter table revlog
  add column if not exists review_type text not null default 'scheduled'
  check (review_type in ('scheduled', 'practice'));

create index if not exists idx_revlog_user_type_reviewed
  on revlog (user_id, review_type, reviewed_at);
