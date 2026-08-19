-- SYMMEDIS recovery integrity checks
-- Run against a restored/recovery Supabase project. Every returned row must have status = 'PASS'.

with checks as (
  select 'public_rls_enabled' as check_name,
         case when not exists (
           select 1
           from pg_catalog.pg_tables
           where schemaname = 'public' and rowsecurity = false
         ) then 'PASS' else 'FAIL' end as status,
         coalesce((select string_agg(tablename, ', ' order by tablename)
                   from pg_catalog.pg_tables
                   where schemaname = 'public' and rowsecurity = false), '') as details

  union all
  select 'projects_have_clients',
         case when not exists (
           select 1 from public.projects p left join public.clients c on c.id = p.client_id where c.id is null
         ) then 'PASS' else 'FAIL' end,
         (select count(*)::text from public.projects p left join public.clients c on c.id = p.client_id where c.id is null)

  union all
  select 'tasks_have_projects',
         case when not exists (
           select 1 from public.tasks t left join public.projects p on p.id = t.project_id where p.id is null
         ) then 'PASS' else 'FAIL' end,
         (select count(*)::text from public.tasks t left join public.projects p on p.id = t.project_id where p.id is null)

  union all
  select 'reports_have_projects',
         case when not exists (
           select 1 from public.reports r left join public.projects p on p.id = r.project_id where p.id is null
         ) then 'PASS' else 'FAIL' end,
         (select count(*)::text from public.reports r left join public.projects p on p.id = r.project_id where p.id is null)

  union all
  select 'documents_have_projects',
         case when not exists (
           select 1 from public.documents d left join public.projects p on p.id = d.project_id where p.id is null
         ) then 'PASS' else 'FAIL' end,
         (select count(*)::text from public.documents d left join public.projects p on p.id = d.project_id where p.id is null)

  union all
  select 'report_versions_have_reports',
         case when not exists (
           select 1 from public.report_versions rv left join public.reports r on r.id = rv.report_id where r.id is null
         ) then 'PASS' else 'FAIL' end,
         (select count(*)::text from public.report_versions rv left join public.reports r on r.id = rv.report_id where r.id is null)

  union all
  select 'report_versions_match_project',
         case when not exists (
           select 1
           from public.report_versions rv
           join public.reports r on r.id = rv.report_id
           where rv.project_id is distinct from r.project_id
         ) then 'PASS' else 'FAIL' end,
         (select count(*)::text
          from public.report_versions rv
          join public.reports r on r.id = rv.report_id
          where rv.project_id is distinct from r.project_id)

  union all
  select 'final_reports_have_version_snapshot',
         case when not exists (
           select 1
           from public.reports r
           where r.state = 'final'
             and not exists (select 1 from public.report_versions rv where rv.report_id = r.id and rv.state = 'final')
         ) then 'PASS' else 'FAIL' end,
         (select count(*)::text
          from public.reports r
          where r.state = 'final'
            and not exists (select 1 from public.report_versions rv where rv.report_id = r.id and rv.state = 'final'))

  union all
  select 'customer_profiles_have_client',
         case when not exists (
           select 1 from public.profiles p where p.role = 'kunde' and p.client_id is null
         ) then 'PASS' else 'FAIL' end,
         (select count(*)::text from public.profiles p where p.role = 'kunde' and p.client_id is null)

  union all
  select 'customer_profiles_client_exists',
         case when not exists (
           select 1
           from public.profiles p
           left join public.clients c on c.id = p.client_id
           where p.role = 'kunde' and c.id is null
         ) then 'PASS' else 'FAIL' end,
         (select count(*)::text
          from public.profiles p
          left join public.clients c on c.id = p.client_id
          where p.role = 'kunde' and c.id is null)

  union all
  select 'staff_profiles_not_client_bound',
         case when not exists (
           select 1 from public.profiles p where p.role in ('intern','admin') and p.client_id is not null
         ) then 'PASS' else 'FAIL' end,
         (select count(*)::text from public.profiles p where p.role in ('intern','admin') and p.client_id is not null)

  union all
  select 'audit_events_present',
         case when exists (select 1 from public.audit_events limit 1) then 'PASS' else 'FAIL' end,
         (select count(*)::text from public.audit_events)
)
select check_name, status, details
from checks
order by case status when 'FAIL' then 0 else 1 end, check_name;
