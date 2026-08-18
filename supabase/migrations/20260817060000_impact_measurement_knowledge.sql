begin;

alter table public.analysis_items
  add column if not exists impact_currency text not null default 'EUR',
  add column if not exists revenue_impact_min numeric(14,2),
  add column if not exists revenue_impact_max numeric(14,2),
  add column if not exists cost_impact_min numeric(14,2),
  add column if not exists cost_impact_max numeric(14,2),
  add column if not exists effort text check (effort is null or effort in ('niedrig','mittel','hoch')),
  add column if not exists time_to_impact_days integer check (time_to_impact_days is null or time_to_impact_days > 0),
  add column if not exists impact_basis text not null default '',
  add column if not exists impact_verified boolean not null default false;

alter table public.analysis_items
  drop constraint if exists analysis_items_revenue_range_check,
  add constraint analysis_items_revenue_range_check check (revenue_impact_min is null or revenue_impact_max is null or revenue_impact_min <= revenue_impact_max),
  drop constraint if exists analysis_items_cost_range_check,
  add constraint analysis_items_cost_range_check check (cost_impact_min is null or cost_impact_max is null or cost_impact_min <= cost_impact_max);

alter table public.tasks add column if not exists source_analysis_item_id uuid references public.analysis_items(id) on delete set null;
create index if not exists tasks_source_analysis_item_id_idx on public.tasks(source_analysis_item_id);
create unique index if not exists tasks_generated_finding_phase_uidx on public.tasks(project_id, source_analysis_item_id, phase_id) where source_analysis_item_id is not null;

alter table public.reports
  add column if not exists generated_from_analysis_run_id uuid references public.analysis_runs(id) on delete set null,
  add column if not exists executive_summary text not null default '',
  add column if not exists content jsonb not null default '{}'::jsonb;
create index if not exists reports_generated_from_run_idx on public.reports(generated_from_analysis_run_id);

create table if not exists public.measurement_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  metric_key text not null,
  label text not null,
  unit text not null default '',
  baseline_value numeric(18,4),
  current_value numeric(18,4),
  target_value numeric(18,4),
  baseline_at date,
  current_at date,
  target_at date,
  source text not null default '',
  customer_visible boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, metric_key)
);
create index if not exists measurement_snapshots_project_idx on public.measurement_snapshots(project_id);
create index if not exists measurement_snapshots_created_by_idx on public.measurement_snapshots(created_by);
alter table public.measurement_snapshots enable row level security;

drop policy if exists "measurement_snapshots_read" on public.measurement_snapshots;
drop policy if exists "measurement_snapshots_staff_insert" on public.measurement_snapshots;
drop policy if exists "measurement_snapshots_staff_update" on public.measurement_snapshots;
create policy "measurement_snapshots_read" on public.measurement_snapshots for select to authenticated using (
  exists (
    select 1 from public.projects pr
    join public.profiles p on p.id=(select auth.uid())
    where pr.id=measurement_snapshots.project_id
      and (p.role in ('intern','admin') or (p.client_id=pr.client_id and measurement_snapshots.customer_visible))
  )
);
create policy "measurement_snapshots_staff_insert" on public.measurement_snapshots for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('intern','admin'))
);
create policy "measurement_snapshots_staff_update" on public.measurement_snapshots for update to authenticated using (
  exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('intern','admin'))
) with check (
  exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('intern','admin'))
);
grant select, insert, update on public.measurement_snapshots to authenticated;

create or replace function public.generate_90_day_plan(p_project_id uuid)
returns integer language plpgsql security invoker set search_path = public, pg_temp as $$
declare inserted_count integer := 0;
begin
  if not exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('intern','admin')) then
    raise exception 'Nur SYMMEDIS-Mitarbeiter dürfen einen 90-Tage-Plan erzeugen.' using errcode='42501';
  end if;

  with ranked as (
    select ai.id, ai.project_id, ai.category_id, ai.recommendation, ai.priority, ai.score,
      row_number() over (order by case ai.priority when 'hoch' then 1 when 'mittel' then 2 else 3 end, ai.score asc, ai.updated_at desc) as rn
    from public.analysis_items ai
    where ai.project_id=p_project_id and coalesce(nullif(trim(ai.recommendation), ''), '') <> ''
    limit 6
  ), payload as (
    select project_id,
      case when rn <= 2 then 'p1' when rn <= 4 then 'p2' else 'p3' end as phase_id,
      category_id, left(recommendation, 240) as title, 'symmedis'::text as responsible_party,
      ''::text as assignee_name, priority, 'offen'::text as status,
      current_date + case when rn <= 2 then 21 when rn <= 4 then 50 else 80 end as due_date,
      'Wirkung nachweisen'::text as kpi, id as source_analysis_item_id
    from ranked
  )
  insert into public.tasks (project_id, phase_id, category_id, title, responsible_party, assignee_name, priority, status, due_date, kpi, source_analysis_item_id, updated_at)
  select project_id, phase_id, category_id, title, responsible_party, assignee_name, priority, status, due_date, kpi, source_analysis_item_id, now() from payload
  on conflict (project_id, source_analysis_item_id, phase_id) where source_analysis_item_id is not null
  do update set category_id=excluded.category_id, title=excluded.title, priority=excluded.priority, due_date=excluded.due_date, kpi=excluded.kpi, updated_at=now();
  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;
revoke all on function public.generate_90_day_plan(uuid) from public, anon;
grant execute on function public.generate_90_day_plan(uuid) to authenticated;

alter table public.documents
  add column if not exists index_status text not null default 'pending',
  add column if not exists index_error text not null default '',
  add column if not exists indexed_at timestamptz;
alter table public.documents drop constraint if exists documents_index_status_check;
alter table public.documents add constraint documents_index_status_check check (index_status in ('pending','indexing','indexed','unsupported','failed'));

create or replace function public.canonicalize_document_actor()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare current_uid uuid := auth.uid(); current_role text;
begin
  if current_uid is null then return new; end if;
  select p.role into current_role from public.profiles p where p.id=current_uid;
  if current_role is null then raise exception 'Kein SYMMEDIS-Profil für aktuellen Benutzer.' using errcode='42501'; end if;
  new.source := case when current_role='kunde' then 'kunde' else 'symmedis' end;
  return new;
end;
$$;
drop trigger if exists documents_canonical_actor on public.documents;
create trigger documents_canonical_actor before insert on public.documents for each row execute function public.canonicalize_document_actor();

create or replace function public.canonicalize_message_actor()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare current_uid uuid := auth.uid(); actor_role text; actor_name text;
begin
  if current_uid is null then return new; end if;
  select p.role, coalesce(nullif(trim(p.full_name),''), p.email, 'Benutzer') into actor_role, actor_name from public.profiles p where p.id=current_uid;
  if actor_role is null then raise exception 'Kein SYMMEDIS-Profil für aktuellen Benutzer.' using errcode='42501'; end if;
  new.sender_kind := case when actor_role='kunde' then 'kunde' else 'symmedis' end;
  new.author := actor_name;
  new.created_by := current_uid;
  return new;
end;
$$;
drop trigger if exists messages_canonical_actor on public.messages;
create trigger messages_canonical_actor before insert on public.messages for each row execute function public.canonicalize_message_actor();

create index if not exists knowledge_chunks_document_chunk_idx on public.knowledge_chunks(document_id, chunk_index);
create unique index if not exists knowledge_chunks_document_chunk_uidx on public.knowledge_chunks(document_id, chunk_index) where document_id is not null;

commit;
