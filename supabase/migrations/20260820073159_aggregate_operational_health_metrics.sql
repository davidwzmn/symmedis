create table public.operational_metric_buckets (
  bucket_start timestamptz not null,
  event_type text not null check (event_type in ('render_failure','workspace_load','save_action','file_transfer','web_vital','auth_action','edge_function')),
  surface text not null check (surface in ('customer','staff','unknown','system')),
  outcome text not null check (outcome in ('success','failure','cancelled','observed')),
  operation text not null default '',
  route_family text not null default '/',
  status_class text not null default '',
  build_sha text not null default '',
  metric_name text not null default '',
  sample_count bigint not null default 0 check (sample_count >= 0),
  total_duration_ms bigint not null default 0 check (total_duration_ms >= 0),
  max_duration_ms integer not null default 0 check (max_duration_ms >= 0),
  metric_sum double precision not null default 0,
  metric_max double precision not null default 0,
  updated_at timestamptz not null default now(),
  primary key (bucket_start, event_type, surface, outcome, operation, route_family, status_class, build_sha, metric_name)
);

alter table public.operational_metric_buckets enable row level security;
revoke all on public.operational_metric_buckets from public, anon, authenticated;
grant all on public.operational_metric_buckets to service_role;

create index operational_metric_buckets_event_time_idx
  on public.operational_metric_buckets (event_type, bucket_start desc);

create or replace function public.record_operational_metric(
  p_event_type text,
  p_surface text,
  p_outcome text,
  p_operation text default '',
  p_route_family text default '/',
  p_http_status integer default null,
  p_build_sha text default '',
  p_duration_ms integer default null,
  p_metric_name text default '',
  p_metric_value double precision default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bucket timestamptz := to_timestamp(floor(extract(epoch from now()) / 300) * 300);
  v_status_class text := case when p_http_status between 100 and 599 then ((p_http_status / 100)::int)::text || 'xx' else '' end;
  v_duration integer := greatest(coalesce(p_duration_ms, 0), 0);
  v_metric double precision := greatest(coalesce(p_metric_value, 0), 0);
begin
  if p_event_type not in ('render_failure','workspace_load','save_action','file_transfer','web_vital','auth_action','edge_function') then
    raise exception 'invalid event type' using errcode = '22023';
  end if;
  if p_surface not in ('customer','staff','unknown','system') then
    raise exception 'invalid surface' using errcode = '22023';
  end if;
  if p_outcome not in ('success','failure','cancelled','observed') then
    raise exception 'invalid outcome' using errcode = '22023';
  end if;
  if length(coalesce(p_operation, '')) > 32 or length(coalesce(p_route_family, '/')) > 96 or length(coalesce(p_build_sha, '')) > 40 or length(coalesce(p_metric_name, '')) > 24 then
    raise exception 'operational metric dimension too long' using errcode = '22023';
  end if;
  if p_duration_ms is not null and (p_duration_ms < 0 or p_duration_ms > 3600000) then
    raise exception 'invalid duration' using errcode = '22023';
  end if;
  if p_metric_value is not null and (p_metric_value < 0 or p_metric_value > 120000) then
    raise exception 'invalid metric value' using errcode = '22023';
  end if;

  insert into public.operational_metric_buckets (
    bucket_start, event_type, surface, outcome, operation, route_family, status_class, build_sha, metric_name,
    sample_count, total_duration_ms, max_duration_ms, metric_sum, metric_max, updated_at
  ) values (
    v_bucket, p_event_type, p_surface, p_outcome, coalesce(p_operation, ''), coalesce(p_route_family, '/'), v_status_class,
    coalesce(p_build_sha, ''), coalesce(p_metric_name, ''), 1, v_duration, v_duration, v_metric, v_metric, now()
  )
  on conflict (bucket_start, event_type, surface, outcome, operation, route_family, status_class, build_sha, metric_name)
  do update set
    sample_count = public.operational_metric_buckets.sample_count + 1,
    total_duration_ms = public.operational_metric_buckets.total_duration_ms + excluded.total_duration_ms,
    max_duration_ms = greatest(public.operational_metric_buckets.max_duration_ms, excluded.max_duration_ms),
    metric_sum = public.operational_metric_buckets.metric_sum + excluded.metric_sum,
    metric_max = greatest(public.operational_metric_buckets.metric_max, excluded.metric_max),
    updated_at = now();
end;
$$;

revoke all on function public.record_operational_metric(text,text,text,text,text,integer,text,integer,text,double precision) from public, anon, authenticated;
grant execute on function public.record_operational_metric(text,text,text,text,text,integer,text,integer,text,double precision) to service_role;

create or replace function public.get_operational_metric_summary(p_hours integer default 24)
returns table (
  event_type text,
  operation text,
  surface text,
  metric_name text,
  samples bigint,
  failures bigint,
  failure_rate numeric,
  avg_duration_ms numeric,
  max_duration_ms integer,
  avg_metric_value numeric,
  max_metric_value double precision
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_hours < 1 or p_hours > 720 then
    raise exception 'invalid window' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('intern','admin')
  ) then
    raise exception 'staff access required' using errcode = '42501';
  end if;

  return query
  select
    b.event_type,
    b.operation,
    b.surface,
    b.metric_name,
    sum(b.sample_count)::bigint as samples,
    sum(case when b.outcome = 'failure' then b.sample_count else 0 end)::bigint as failures,
    round((sum(case when b.outcome = 'failure' then b.sample_count else 0 end)::numeric / nullif(sum(b.sample_count), 0)::numeric), 4) as failure_rate,
    round((sum(b.total_duration_ms)::numeric / nullif(sum(case when b.total_duration_ms > 0 then b.sample_count else 0 end), 0)::numeric), 1) as avg_duration_ms,
    max(b.max_duration_ms)::integer as max_duration_ms,
    round((sum(b.metric_sum)::numeric / nullif(sum(case when b.metric_name <> '' then b.sample_count else 0 end), 0)::numeric), 3) as avg_metric_value,
    max(b.metric_max)::double precision as max_metric_value
  from public.operational_metric_buckets b
  where b.bucket_start >= now() - make_interval(hours => p_hours)
  group by b.event_type, b.operation, b.surface, b.metric_name
  order by b.event_type, b.operation, b.surface, b.metric_name;
end;
$$;

revoke all on function public.get_operational_metric_summary(integer) from public, anon;
grant execute on function public.get_operational_metric_summary(integer) to authenticated;
