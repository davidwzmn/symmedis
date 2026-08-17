drop policy if exists symmedis_project_files_delete_unregistered_customer on storage.objects;
create policy symmedis_project_files_delete_unregistered_customer
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-files'
  and owner_id = (select auth.uid()::text)
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'kunde'
      and p.client_id::text = (storage.foldername(objects.name))[1]
      and exists (
        select 1
        from public.projects pr
        where pr.client_id = p.client_id
          and pr.id::text = (storage.foldername(objects.name))[2]
      )
  )
  and not exists (
    select 1
    from public.documents d
    where d.storage_path = objects.name
  )
);