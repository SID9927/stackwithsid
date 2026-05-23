-- ============================================================
-- Storage Policies for: article-images bucket
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Allow authenticated users (admins) to UPLOAD images
create policy "Authenticated users can upload article images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'article-images');

-- 2. Allow authenticated users to DELETE their uploaded images
create policy "Authenticated users can delete article images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'article-images');

-- 3. Allow PUBLIC reads (the bucket is already public, but this makes it explicit)
create policy "Anyone can view article images"
on storage.objects
for select
to public
using (bucket_id = 'article-images');
