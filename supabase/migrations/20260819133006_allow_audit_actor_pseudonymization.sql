-- Audit-Ereignisse bleiben inhaltlich append-only.
-- Einziger zulässiger UPDATE-Fall ist die FK-Pseudonymisierung eines gelöschten
-- Auth-Users: actor_user_id darf von einem UUID-Wert auf NULL wechseln, während
-- jede andere Audit-Spalte unverändert bleiben muss.
create or replace function public.prevent_audit_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
     and old.actor_user_id is not null
     and new.actor_user_id is null
     and (to_jsonb(new) - 'actor_user_id') is not distinct from (to_jsonb(old) - 'actor_user_id') then
    return new;
  end if;

  raise exception 'audit_events is append-only';
end;
$$;
