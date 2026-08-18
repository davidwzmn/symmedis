drop policy if exists reports_staff_insert on public.reports;
drop policy if exists reports_staff_update on public.reports;
drop policy if exists reports_staff_delete on public.reports;

create policy reports_staff_insert
on public.reports for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects pr
    join public.clients c on c.id = pr.client_id
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = reports.project_id
      and p.role in ('intern','admin')
      and p.organization_id = c.organization_id
  )
);

create policy reports_staff_update
on public.reports for update
to authenticated
using (
  exists (
    select 1
    from public.projects pr
    join public.clients c on c.id = pr.client_id
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = reports.project_id
      and p.role in ('intern','admin')
      and p.organization_id = c.organization_id
  )
)
with check (
  exists (
    select 1
    from public.projects pr
    join public.clients c on c.id = pr.client_id
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = reports.project_id
      and p.role in ('intern','admin')
      and p.organization_id = c.organization_id
  )
);

create policy reports_staff_delete
on public.reports for delete
to authenticated
using (
  exists (
    select 1
    from public.projects pr
    join public.clients c on c.id = pr.client_id
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = reports.project_id
      and p.role in ('intern','admin')
      and p.organization_id = c.organization_id
  )
);
