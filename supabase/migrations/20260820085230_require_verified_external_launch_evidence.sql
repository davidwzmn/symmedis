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
      e.verified_at,
      case
        when r.gate_key = 'leaked_password_protection' then coalesce(e.status, 'pending') in ('confirmed','verified')
        else coalesce(e.status, 'pending') = 'verified'
      end as passed
    from required r
    cross join me
    left join public.launch_gate_evidence e
      on e.organization_id = me.organization_id and e.gate_key = r.gate_key
  )
  select jsonb_build_object(
    'ready', coalesce(bool_and(passed) filter (where hard_gate), false),
    'verifiedCount', count(*) filter (where passed),
    'totalCount', count(*),
    'gates', coalesce(jsonb_agg(jsonb_build_object(
      'key', gate_key,
      'label', label,
      'hardGate', hard_gate,
      'status', status,
      'source', source,
      'evidenceNote', evidence_note,
      'verifiedAt', verified_at,
      'passed', passed
    ) order by gate_key), '[]'::jsonb)
  )
  from gates;
$$;

revoke all on function public.get_launch_readiness() from public, anon;
grant execute on function public.get_launch_readiness() to authenticated;
