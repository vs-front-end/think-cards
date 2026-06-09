-- ============================================================
-- 003_card_audio.sql
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-audio',
  'card-audio',
  true,
  1048576, -- 1MB in bytes
  array['audio/mpeg']
);

-- ============================================================
-- RLS — card-audio
-- ============================================================

create policy "card-audio: public read"
  on storage.objects for select
  using (bucket_id = 'card-audio');

create policy "card-audio: insert own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'card-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "card-audio: update own folder"
  on storage.objects for update
  using (
    bucket_id = 'card-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "card-audio: delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'card-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
