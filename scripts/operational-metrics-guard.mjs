import { readFile } from 'node:fs/promises'

const migration = await readFile('supabase/migrations/20260820073159_aggregate_operational_health_metrics.sql', 'utf8')
const hardening = await readFile('supabase/migrations/20260820073530_harden_operational_metric_access.sql', 'utf8')
const edge = await readFile('supabase/functions/operational-telemetry/index.ts', 'utf8')
const client = await readFile('src/lib/supabase.js', 'utf8')
const failures = []

const requireText = (source, text, label) => { if (!source.includes(text)) failures.push(`${label}: ${text}`) }
const forbidText = (source, text, label) => { if (source.includes(text)) failures.push(`${label}: ${text}`) }

for (const signature of [
  'create table public.operational_metric_buckets',
  'alter table public.operational_metric_buckets enable row level security',
  'revoke all on public.operational_metric_buckets from public, anon, authenticated',
  'create or replace function public.record_operational_metric',
  'sample_count bigint',
  'total_duration_ms bigint',
  'max_duration_ms integer',
]) requireText(migration, signature, 'Aggregate metric contract missing')

for (const signature of [
  'operational_metric_buckets_deny_anon',
  'operational_metric_buckets_deny_authenticated',
  'create or replace function private.get_operational_metric_summary',
  'revoke all on function private.get_operational_metric_summary(integer) from public, anon, authenticated',
  'grant execute on function private.get_operational_metric_summary(integer) to service_role',
]) requireText(hardening, signature, 'Operational metric access hardening missing')

for (const event of ['auth_action', 'edge_function']) requireText(edge, `'${event}'`, 'Edge telemetry event missing')
requireText(edge, "client.rpc('record_operational_metric'", 'Edge function does not persist aggregate metrics')
requireText(edge, "kind: 'SYMMEDIS_OPERATION_STORE_FAILURE'", 'Store failure marker missing')
requireText(client, "eventType: 'auth_action'", 'Auth telemetry missing')
requireText(client, "trackedOperation('edge_function'", 'Edge function telemetry wrapper missing')

for (const sensitive of ['email text', 'project_id uuid', 'client_id uuid', 'user_id uuid', 'request_body', 'payload jsonb']) {
  forbidText(migration, sensitive, 'Aggregate table must not contain identifying/raw payload fields')
}

if (failures.length) {
  console.error('SYMMEDIS Operational Metrics Guard: FEHLGESCHLAGEN')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('SYMMEDIS Operational Metrics Guard: OK')
console.log('✓ Operational events persist only privacy-safe aggregate buckets')
console.log('✓ Browser roles cannot read or write metric buckets directly')
console.log('✓ Summary access stays private and service-role-only')
console.log('✓ Auth and selected Edge Function reliability are instrumented')
