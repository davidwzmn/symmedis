drop policy if exists launch_gate_staff_insert on public.launch_gate_evidence;
drop policy if exists launch_gate_staff_update on public.launch_gate_evidence;

create policy launch_gate_admin_insert on public.launch_gate_evidence
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.profiles me
    where me.id = (select auth.uid())
      and me.role = 'admin'
      and me.organization_id = launch_gate_evidence.organization_id
  )
);

create policy launch_gate_admin_update on public.launch_gate_evidence
for update to authenticated
using (
  exists (
    select 1 from public.profiles me
    where me.id = (select auth.uid())
      and me.role = 'admin'
      and me.organization_id = launch_gate_evidence.organization_id
  )
)
with check (
  exists (
    select 1 from public.profiles me
    where me.id = (select auth.uid())
      and me.role = 'admin'
      and me.organization_id = launch_gate_evidence.organization_id
  )
);
