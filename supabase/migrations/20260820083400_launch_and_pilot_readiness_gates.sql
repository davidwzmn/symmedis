create table public.launch_gate_evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  gate_key text not null check (gate_key in ('leaked_password_protection','custom_smtp','real_invite_delivery','real_magic_link_login','restore_drill')),
  status text not null default 'pending' check (status in ('pending','confirmed','verified','blocked')),
  source text not null default 'system' check (source in ('system','user_confirmed','dashboard','real_mailbox','restore_drill')),
  evidence_note text not null default '' check (char_length(evidence_note) <= 2000),
  verified_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, gate_key)
);

alter table public.launch_gate_evidence enable row level security;
revoke all on public.launch_gate_evidence from public, anon;
grant select, insert, update on public.launch_gate_evidence to authenticated;

create policy launch_gate_staff_select on public.launch_gate_evidence
for select to authenticated
using (
  exists (
    select 1 from public.profiles me
    where me.id = (select auth.uid())
      and me.role in ('intern','admin')
      and me.organization_id = launch_gate_evidence.organization_id
  )
);

create policy launch_gate_staff_insert on public.launch_gate_evidence
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.profiles me
    where me.id = (select auth.uid())
      and me.role in ('intern','admin')
      and me.organization_id = launch_gate_evidence.organization_id
  )
);

create policy launch_gate_staff_update on public.launch_gate_evidence
for update to authenticated
using (
  exists (
    select 1 from public.profiles me
    where me.id = (select auth.uid())
      and me.role in ('intern','admin')
      and me.organization_id = launch_gate_evidence.organization_id
  )
)
with check (
  exists (
    select 1 from public.profiles me
    where me.id = (select auth.uid())
      and me.role in ('intern','admin')
      and me.organization_id = launch_gate_evidence.organization_id
  )
);

create index launch_gate_evidence_created_by_idx on public.launch_gate_evidence(created_by);

create or replace function public.get_launch_readiness()
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  with me as (
    select id, organization_id, role
    from public.profiles
    where id = (select auth.uid())
      and role in ('intern','admin')
  ), required(gate_key, label, hard_gate) as (
    values
      ('leaked_password_protection'::text, 'Leaked Password Protection', true),
      ('custom_smtp'::text, 'Custom SMTP / Absenderdomain', true),
      ('real_invite_delivery'::text, 'Reale Invite-Zustellung', true),
      ('real_magic_link_login'::text, 'Realer Magic-Link-Login', true),
      ('restore_drill'::text, 'Restore-Drill', true)
  ), gates as (
    select
      r.gate_key,
      r.label,
      r.hard_gate,
      coalesce(e.status, 'pending') as status,
      coalesce(e.source, 'system') as source,
      coalesce(e.evidence_note, '') as evidence_note,
      e.verified_at
    from required r
    cross join me
    left join public.launch_gate_evidence e
      on e.organization_id = me.organization_id and e.gate_key = r.gate_key
  )
  select jsonb_build_object(
    'ready', coalesce(bool_and(status in ('confirmed','verified')) filter (where hard_gate), false),
    'verifiedCount', count(*) filter (where status in ('confirmed','verified')),
    'totalCount', count(*),
    'gates', coalesce(jsonb_agg(jsonb_build_object(
      'key', gate_key,
      'label', label,
      'hardGate', hard_gate,
      'status', status,
      'source', source,
      'evidenceNote', evidence_note,
      'verifiedAt', verified_at
    ) order by gate_key), '[]'::jsonb)
  )
  from gates;
$$;

revoke all on function public.get_launch_readiness() from public, anon;
grant execute on function public.get_launch_readiness() to authenticated;

create or replace function public.get_pilot_start_readiness(p_project_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  with scope as (
    select
      p.id,
      p.name,
      p.status,
      p.start_date,
      p.result_date,
      p.metadata,
      c.id as client_id,
      c.contact,
      c.account_manager_key,
      c.organization_id
    from public.projects p
    join public.clients c on c.id = p.client_id
    join public.profiles me on me.id = (select auth.uid())
    where p.id = p_project_id
      and me.role in ('intern','admin')
      and me.organization_id = c.organization_id
  ), facts as (
    select
      s.*,
      not (
        coalesce((s.metadata->>'e2e_fixture')::boolean, false)
        or coalesce(s.metadata->>'purpose', '') = 'e2e'
        or coalesce(s.metadata->>'environment', '') = 'staging'
      ) as real_project,
      (s.start_date is not null) as has_start_date,
      (s.result_date is not null) as has_result_date,
      (coalesce(s.contact->>'email','') ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') as has_contact_email,
      (nullif(trim(coalesce(s.account_manager_key,'')), '') is not null) as has_owner,
      exists (
        select 1 from public.profiles customer
        where customer.organization_id = s.organization_id
          and customer.client_id = s.client_id
          and customer.role = 'kunde'
      ) as has_customer_access
    from scope s
  )
  select jsonb_build_object(
    'projectId', id,
    'ready', real_project and has_start_date and has_result_date and has_contact_email and has_owner and has_customer_access,
    'gates', jsonb_build_array(
      jsonb_build_object('key','real_project','label','Reales Projekt statt E2E-Fixture','passed',real_project),
      jsonb_build_object('key','start_date','label','Pilotstart terminiert','passed',has_start_date),
      jsonb_build_object('key','result_date','label','Ergebnis-/Reviewtermin terminiert','passed',has_result_date),
      jsonb_build_object('key','contact_email','label','Realer Ansprechpartner mit E-Mail','passed',has_contact_email),
      jsonb_build_object('key','owner','label','SYMMEDIS-Betreuung zugewiesen','passed',has_owner),
      jsonb_build_object('key','customer_access','label','Kundenportal-Zugang vorhanden','passed',has_customer_access)
    )
  )
  from facts;
$$;

revoke all on function public.get_pilot_start_readiness(uuid) from public, anon;
grant execute on function public.get_pilot_start_readiness(uuid) to authenticated;
