drop policy if exists report_versions_read on public.report_versions;

create policy report_versions_read
on public.report_versions
for select
to authenticated
using (
  exists (
    select 1
    from public.projects pr
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = report_versions.project_id
      and (
        p.role in ('intern','admin')
        or (
          p.role = 'kunde'
          and p.client_id = pr.client_id
          and report_versions.state = 'final'
        )
      )
  )
);

revoke insert, update, delete, truncate on public.report_versions from anon, authenticated;
