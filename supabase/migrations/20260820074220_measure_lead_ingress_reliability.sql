alter table public.operational_metric_buckets drop constraint operational_metric_buckets_event_type_check;
alter table public.operational_metric_buckets add constraint operational_metric_buckets_event_type_check check (event_type in ('render_failure','workspace_load','save_action','file_transfer','web_vital','auth_action','edge_function','lead_ingress'));

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
  if p_event_type not in ('render_failure','workspace_load','save_action','file_transfer','web_vital','auth_action','edge_function','lead_ingress') then raise exception 'invalid event type' using errcode = '22023'; end if;
  if p_surface not in ('customer','staff','unknown','system') then raise exception 'invalid surface' using errcode = '22023'; end if;
  if p_outcome not in ('success','failure','cancelled','observed') then raise exception 'invalid outcome' using errcode = '22023'; end if;
  if length(coalesce(p_operation, '')) > 32 or length(coalesce(p_route_family, '/')) > 96 or length(coalesce(p_build_sha, '')) > 40 or length(coalesce(p_metric_name, '')) > 24 then raise exception 'operational metric dimension too long' using errcode = '22023'; end if;
  if p_duration_ms is not null and (p_duration_ms < 0 or p_duration_ms > 3600000) then raise exception 'invalid duration' using errcode = '22023'; end if;
  if p_metric_value is not null and (p_metric_value < 0 or p_metric_value > 120000) then raise exception 'invalid metric value' using errcode = '22023'; end if;

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
