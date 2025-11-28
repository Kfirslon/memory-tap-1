-- ============================================
-- UPDATE Storage Bucket Policies for 'Memories'
-- Run this to fix the bucket name case sensitivity
-- ============================================

-- First, drop the old policies if they exist
drop policy if exists "Users can upload their own audio" on storage.objects;
drop policy if exists "Users can read their own audio" on storage.objects;
drop policy if exists "Users can delete their own audio" on storage.objects;

-- Create new policies with 'Memories' (Capital M)

-- Policy: Users can upload their own audio
create policy "Users can upload their own audio"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'Memories' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own audio
create policy "Users can read their own audio"
on storage.objects for select
to authenticated
using (
  bucket_id = 'Memories' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own audio
create policy "Users can delete their own audio"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'Memories' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
