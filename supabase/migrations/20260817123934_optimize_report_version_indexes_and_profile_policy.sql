create index if not exists report_versions_created_by_idx
  on public.report_versions (created_by);

create index if not exists report_versions_generated_from_analysis_run_id_idx
  on public.report_versions (generated_from_analysis_run_id);

drop policy if exists profiles_read_self on public.profiles;
drop policy if exists profiles_staff_read_same_org on public.profiles;

create policy profiles_read_self_or_same_org_staff
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
  or private.is_staff_of_org(organization_id)
);
