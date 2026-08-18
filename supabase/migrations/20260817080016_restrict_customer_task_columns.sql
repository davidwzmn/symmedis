create or replace function public.guard_customer_task_update()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  profile_role text;
begin
  if auth.uid() is null then
    return new;
  end if;

  select p.role into profile_role
  from public.profiles p
  where p.id = (select auth.uid());

  if profile_role = 'kunde' then
    if (to_jsonb(new) - array['status','updated_at']) is distinct from (to_jsonb(old) - array['status','updated_at']) then
      raise exception 'Kunden dürfen bei Aufgaben ausschließlich den Status ändern.' using errcode = '42501';
    end if;
    new.updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_guard_customer_update on public.tasks;
create trigger tasks_guard_customer_update
before update on public.tasks
for each row execute function public.guard_customer_task_update();
