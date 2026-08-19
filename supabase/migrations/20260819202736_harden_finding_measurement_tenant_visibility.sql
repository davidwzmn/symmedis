drop policy if exists measurement_snapshots_read on public.measurement_snapshots;
drop policy if exists measurement_snapshots_staff_insert on public.measurement_snapshots;
drop policy if exists measurement_snapshots_staff_update on public.measurement_snapshots;

create policy measurement_snapshots_read
on public.measurement_snapshots
for select
to authenticated
using (
  exists (
    select 1
    from public.projects pr
    join public.clients c on c.id = pr.client_id
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = measurement_snapshots.project_id
      and (
        (
          p.role = any (array['intern'::text, 'admin'::text])
          and p.organization_id = c.organization_id
        )
        or (
          p.role = 'kunde'
          and p.client_id = pr.client_id
          and measurement_snapshots.customer_visible
          and (
            measurement_snapshots.analysis_item_id is null
            or exists (
              select 1
              from public.analysis_items ai
              where ai.id = measurement_snapshots.analysis_item_id
                and ai.project_id = measurement_snapshots.project_id
                and ai.customer_visible
                and ai.approval_status = 'kunde'
            )
          )
        )
      )
  )
);

create policy measurement_snapshots_staff_insert
on public.measurement_snapshots
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects pr
    join public.clients c on c.id = pr.client_id
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = measurement_snapshots.project_id
      and p.role = any (array['intern'::text, 'admin'::text])
      and p.organization_id = c.organization_id
  )
);

create policy measurement_snapshots_staff_update
on public.measurement_snapshots
for update
to authenticated
using (
  exists (
    select 1
    from public.projects pr
    join public.clients c on c.id = pr.client_id
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = measurement_snapshots.project_id
      and p.role = any (array['intern'::text, 'admin'::text])
      and p.organization_id = c.organization_id
  )
)
with check (
  exists (
    select 1
    from public.projects pr
    join public.clients c on c.id = pr.client_id
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = measurement_snapshots.project_id
      and p.role = any (array['intern'::text, 'admin'::text])
      and p.organization_id = c.organization_id
  )
);
