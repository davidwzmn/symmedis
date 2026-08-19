create or replace function private.guard_customer_document_registration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_project_client uuid;
  v_object_owner text;
  v_parts text[];
begin
  if auth.uid() is null then
    return new;
  end if;

  select * into v_profile
  from public.profiles
  where id = auth.uid();

  if not found then
    raise exception 'Kein SYMMEDIS-Profil für diesen Zugang.' using errcode = '42501';
  end if;

  if v_profile.role <> 'kunde' then
    return new;
  end if;

  -- Customer identity is derived server-side, never trusted from browser metadata.
  new.source := 'kunde';
  new.customer_visible := true;

  select client_id into v_project_client
  from public.projects
  where id = new.project_id;

  if v_project_client is null or v_project_client <> v_profile.client_id then
    raise exception 'Projekt gehört nicht zu diesem Kundenzugang.' using errcode = '42501';
  end if;

  v_parts := storage.foldername(new.storage_path);
  if coalesce(array_length(v_parts, 1), 0) < 2
     or v_parts[1] <> v_profile.client_id::text
     or v_parts[2] <> new.project_id::text then
    raise exception 'Storage-Pfad gehört nicht zu diesem Kundenprojekt.' using errcode = '42501';
  end if;

  select o.owner_id into v_object_owner
  from storage.objects o
  where o.bucket_id = 'project-files'
    and o.name = new.storage_path;

  if v_object_owner is distinct from auth.uid()::text then
    raise exception 'Kundendokument darf nur auf eine selbst hochgeladene Datei verweisen.' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.guard_customer_document_registration() from public, anon, authenticated;

drop policy if exists symmedis_project_files_select_unregistered_customer_cleanup on storage.objects;
create policy symmedis_project_files_select_unregistered_customer_cleanup
on storage.objects
for select
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
