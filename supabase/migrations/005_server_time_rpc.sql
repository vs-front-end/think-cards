-- ============================================================
-- 005_server_time_rpc.sql
-- Expose server timestamp for reliable cross-device sync.
-- ============================================================

create or replace function get_server_time()
returns timestamptz
language sql
stable
as $$
  select now();
$$;
