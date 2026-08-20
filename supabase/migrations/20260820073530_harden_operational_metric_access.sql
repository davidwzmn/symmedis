drop function if exists public.get_operational_metric_summary(integer);

create policy operational_metric_buckets_deny_anon
on public.operational_metric_buckets
for all
to anon
using (false)
with check (false);

create policy operational_metric_buckets_deny_authenticated
on public.operational_metric_buckets
for all
to authenticated
using (false)
with check (false);

create or replace function private.get_operational_metric_summary(p_hours integer default 24)
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
language sql
security definer
set search_path = ''
as $$
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
  where b.bucket_start >= now() - make_interval(hours => greatest(1, least(coalesce(p_hours, 24), 720)))
  group by b.event_type, b.operation, b.surface, b.metric_name
  order by b.event_type, b.operation, b.surface, b.metric_name;
$$;

revoke all on function private.get_operational_metric_summary(integer) from public, anon, authenticated;
grant execute on function private.get_operational_metric_summary(integer) to service_role;
