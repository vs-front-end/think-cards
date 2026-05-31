-- ============================================================
-- 009_drop_public_list_policies.sql
-- Drop the broad "public read" SELECT policies on storage.objects.
-- Public buckets serve objects by URL without them; the policies
-- only enabled clients to LIST/enumerate every file path in the
-- bucket, which we don't want. Keeps a fresh setup in sync with
-- the change already applied in the dashboard.
-- ============================================================

drop policy if exists "avatars: public read"     on storage.objects;
drop policy if exists "card-images: public read"  on storage.objects;
