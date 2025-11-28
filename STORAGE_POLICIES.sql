-- ============================================
-- Storage Bucket Policies for Audio Files
-- Run this AFTER creating the 'memories' bucket
-- ============================================

-- Policy: Users can upload their own audio
create policy "Users can upload their own audio"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'memories' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own audio
create policy "Users can read their own audio"
on storage.objects for select
to authenticated
using (
  bucket_id = 'memories' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own audio
create policy "Users can delete their own audio"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'memories' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
