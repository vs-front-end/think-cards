-- ============================================================
-- 002_storage.sql
-- ============================================================

-- ============================================================
-- BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB in bytes
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-images',
  'card-images',
  true,
  5242880, -- 5MB in bytes
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
);

-- ============================================================
-- RLS — avatars
-- ============================================================

create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: insert own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: update own folder"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- RLS — card-images
-- ============================================================

create policy "card-images: public read"
  on storage.objects for select
  using (bucket_id = 'card-images');

create policy "card-images: insert own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "card-images: update own folder"
  on storage.objects for update
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "card-images: delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
