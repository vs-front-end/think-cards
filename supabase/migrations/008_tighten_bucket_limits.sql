-- ============================================================
-- 008_tighten_bucket_limits.sql
-- Lower per-file size limits. The client compresses uploads
-- well below these, so legit uploads are unaffected; this just
-- shrinks the blast radius of a scripted storage-abuse attempt.
-- ============================================================

update storage.buckets
  set file_size_limit = 1048576 -- 1MB
  where id = 'card-images';

update storage.buckets
  set file_size_limit = 524288 -- 512KB
  where id = 'avatars';
