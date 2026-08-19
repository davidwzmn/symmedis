-- Finaler Least-Privilege-Vertrag für Aufgabenstatus:
-- Der Browser erhält ausschließlich UPDATE auf der Spalte status.
-- RLS begrenzt die erlaubten Zeilen nach Rolle, Mandant und Zuständigkeit.
-- Audit + updated_at laufen über einen nicht exponierten privaten Trigger.

-- Frühere RPC-Variante explizit entfernen, damit kein öffentlich erreichbarer
-- SECURITY-DEFINER-Endpunkt für Aufgabenstatus bestehen bleibt.
drop function if exists public.update_task_status(uuid, text);

-- Kein tabellenweites UPDATE für Browserrollen. Nur die Statusspalte ist schreibbar.
revoke update on table public.tasks from authenticated;
grant update (status) on table public.tasks to authenticated;

-- Ein gemeinsamer UPDATE-Vertrag für Staff/Admin und Kunden.
drop policy if exists tasks_update on public.tasks;
drop policy if exists tasks_staff_update on public.tasks;
drop policy if exists tasks_status_update on public.tasks;
create policy tasks_status_update
on public.tasks
for update
to authenticated
using (
  exists (
    select 1
    from public.projects pr
    join public.clients c on c.id = pr.client_id
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = tasks.project_id
      and (
        (
          p.role in ('intern', 'admin')
          and p.organization_id = c.organization_id
        )
        or (
          p.role = 'kunde'
          and p.client_id = pr.client_id
          and tasks.responsible_party = 'kunde'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.projects pr
    join public.clients c on c.id = pr.client_id
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = tasks.project_id
      and (
        (
          p.role in ('intern', 'admin')
          and p.organization_id = c.organization_id
        )
        or (
          p.role = 'kunde'
          and p.client_id = pr.client_id
          and tasks.responsible_party = 'kunde'
        )
      )
  )
);

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.audit_task_status_update()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
declare
  v_actor uuid := auth.uid();
  v_role text;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  new.updated_at := now();

  select p.role
    into v_role
  from public.profiles p
  where p.id = v_actor;

  insert into public.audit_events (
    organization_id,
    client_id,
    project_id,
    actor_user_id,
    event_type,
    entity_type,
    entity_id,
    summary,
    metadata
  )
  select
    c.organization_id,
    pr.client_id,
    new.project_id,
    v_actor,
    'task.status_updated',
    'task',
    new.id::text,
    'Aufgabenstatus aktualisiert',
    jsonb_build_object(
      'from', old.status,
      'to', new.status,
      'responsible_party', new.responsible_party,
      'actor_role', v_role
    )
  from public.projects pr
  join public.clients c on c.id = pr.client_id
  where pr.id = new.project_id;

  return new;
end;
$$;

-- Triggerfunktionen werden nur durch den Datenbank-Trigger ausgeführt und sind
-- weder als RPC noch anderweitig für Browserrollen aufrufbar.
revoke all on function private.audit_task_status_update() from public;
revoke all on function private.audit_task_status_update() from anon;
revoke all on function private.audit_task_status_update() from authenticated;

drop trigger if exists tasks_status_audit on public.tasks;
create trigger tasks_status_audit
before update of status on public.tasks
for each row
execute function private.audit_task_status_update();
