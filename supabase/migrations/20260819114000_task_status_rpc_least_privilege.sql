create or replace function public.update_task_status(p_task_id uuid, p_status text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_client_id uuid;
  v_org_id uuid;
  v_task_project_id uuid;
  v_task_responsible text;
  v_project_client_id uuid;
  v_project_org_id uuid;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert.' using errcode = '42501';
  end if;

  if p_status not in ('offen', 'in-arbeit', 'erledigt') then
    raise exception 'Ungültiger Aufgabenstatus.' using errcode = '22023';
  end if;

  select p.role, p.client_id, p.organization_id
    into v_role, v_client_id, v_org_id
  from public.profiles p
  where p.id = v_user_id;

  if v_role is null then
    raise exception 'Kein freigeschaltetes Profil.' using errcode = '42501';
  end if;

  select t.project_id, t.responsible_party, pr.client_id, c.organization_id
    into v_task_project_id, v_task_responsible, v_project_client_id, v_project_org_id
  from public.tasks t
  join public.projects pr on pr.id = t.project_id
  join public.clients c on c.id = pr.client_id
  where t.id = p_task_id;

  if v_task_project_id is null then
    return false;
  end if;

  if v_role in ('intern', 'admin') then
    if v_org_id is distinct from v_project_org_id then
      raise exception 'Aufgabe gehört zu einer anderen Organisation.' using errcode = '42501';
    end if;
  elsif v_role = 'kunde' then
    if v_client_id is distinct from v_project_client_id or v_task_responsible <> 'kunde' then
      raise exception 'Kunden dürfen nur eigene Aufgaben aktualisieren.' using errcode = '42501';
    end if;
  else
    raise exception 'Rolle darf Aufgaben nicht aktualisieren.' using errcode = '42501';
  end if;

  update public.tasks
  set status = p_status,
      updated_at = now()
  where id = p_task_id;

  return found;
end;
$$;

revoke all on function public.update_task_status(uuid, text) from public;
revoke all on function public.update_task_status(uuid, text) from anon;
grant execute on function public.update_task_status(uuid, text) to authenticated;

-- Browserrollen ändern Aufgaben nie mehr direkt. Alle Statusänderungen laufen über
-- update_task_status(), das Rolle, Mandant, Zuständigkeit und erlaubte Statuswerte prüft.
revoke update on table public.tasks from authenticated;

drop policy if exists tasks_update on public.tasks;
drop policy if exists tasks_staff_update on public.tasks;
create policy tasks_staff_update
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
      and p.role in ('intern', 'admin')
      and p.organization_id = c.organization_id
  )
)
with check (
  exists (
    select 1
    from public.projects pr
    join public.clients c on c.id = pr.client_id
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = tasks.project_id
      and p.role in ('intern', 'admin')
      and p.organization_id = c.organization_id
  )
);
