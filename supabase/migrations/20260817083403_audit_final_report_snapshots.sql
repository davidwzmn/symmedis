create or replace function private.snapshot_final_report()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  next_version integer;
  actor_id uuid := (select auth.uid());
begin
  if new.state <> 'final' then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and old.state = 'final'
     and old.title is not distinct from new.title
     and old.report_type is not distinct from new.report_type
     and old.report_date is not distinct from new.report_date
     and old.author is not distinct from new.author
     and old.storage_path is not distinct from new.storage_path
     and old.generated_from_analysis_run_id is not distinct from new.generated_from_analysis_run_id
     and old.executive_summary is not distinct from new.executive_summary
     and old.content is not distinct from new.content then
    return new;
  end if;

  select coalesce(max(rv.version_number), 0) + 1
    into next_version
    from public.report_versions rv
   where rv.report_id = new.id;

  insert into public.report_versions (
    report_id, project_id, version_number, state, title, report_type, report_date,
    author, storage_path, generated_from_analysis_run_id, executive_summary, content, created_by
  ) values (
    new.id, new.project_id, next_version, new.state, new.title, new.report_type, new.report_date,
    new.author, new.storage_path, new.generated_from_analysis_run_id, new.executive_summary, new.content,
    actor_id
  );

  insert into public.audit_events (
    organization_id, client_id, project_id, actor_user_id,
    event_type, entity_type, entity_id, summary, metadata
  )
  select
    c.organization_id, pr.client_id, new.project_id, actor_id,
    'report.version_published', 'report', new.id,
    'Report final freigegeben',
    jsonb_build_object('version', next_version, 'report_type', new.report_type, 'title', new.title)
  from public.projects pr
  join public.clients c on c.id = pr.client_id
  where pr.id = new.project_id;

  return new;
end;
$$;

revoke all on function private.snapshot_final_report() from public;
