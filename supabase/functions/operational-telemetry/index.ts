import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const EVENT_TYPES = new Set(['render_failure', 'workspace_load', 'save_action', 'file_transfer', 'web_vital', 'auth_action', 'edge_function'])
const SURFACES = new Set(['customer', 'staff', 'unknown', 'system'])
const OUTCOMES = new Set(['success', 'failure', 'cancelled', 'observed'])
const OPERATIONS = new Set(['insert', 'update', 'upload', 'download', 'delete', 'login', 'logout', 'refresh', 'index-document', 'invite-user'])
const METRICS = new Set(['lcp', 'cls', 'inp'])
const TRACE_RE = /^[0-9a-f]{32}$/i
const BUILD_RE = /^[0-9a-f]{7,40}$/i
const ROUTE_RE = /^\/[a-z0-9_\/-]{0,95}$/i

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function integer(value: unknown, min: number, max: number) {
  if (value == null) return undefined
  const number = Number(value)
  if (!Number.isInteger(number) || number < min || number > max) return null
  return number
}

function finite(value: unknown, min: number, max: number) {
  if (value == null) return undefined
  const number = Number(value)
  if (!Number.isFinite(number) || number < min || number > max) return null
  return number
}

function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return json(400, { error: 'invalid_payload' })

  const eventType = typeof body.eventType === 'string' ? body.eventType : ''
  const surface = typeof body.surface === 'string' ? body.surface : 'unknown'
  const outcome = typeof body.outcome === 'string' ? body.outcome : 'observed'
  const routeFamily = typeof body.routeFamily === 'string' ? body.routeFamily : '/'
  const durationMs = integer(body.durationMs, 0, 3_600_000)
  const httpStatus = integer(body.httpStatus, 100, 599)
  const traceId = typeof body.traceId === 'string' ? body.traceId : undefined
  const buildSha = typeof body.buildSha === 'string' ? body.buildSha : undefined
  const operation = typeof body.operation === 'string' ? body.operation : undefined
  const metricName = typeof body.metricName === 'string' ? body.metricName : undefined
  const metricValue = finite(body.metricValue, 0, 120_000)

  if (!EVENT_TYPES.has(eventType)) return json(400, { error: 'invalid_event_type' })
  if (!SURFACES.has(surface)) return json(400, { error: 'invalid_surface' })
  if (!OUTCOMES.has(outcome)) return json(400, { error: 'invalid_outcome' })
  if (!ROUTE_RE.test(routeFamily)) return json(400, { error: 'invalid_route_family' })
  if (durationMs === null) return json(400, { error: 'invalid_duration' })
  if (httpStatus === null) return json(400, { error: 'invalid_http_status' })
  if (traceId && !TRACE_RE.test(traceId)) return json(400, { error: 'invalid_trace_id' })
  if (buildSha && !BUILD_RE.test(buildSha)) return json(400, { error: 'invalid_build_sha' })
  if (operation && !OPERATIONS.has(operation)) return json(400, { error: 'invalid_operation' })

  if (eventType === 'web_vital') {
    if (!metricName || !METRICS.has(metricName) || metricValue == null) return json(400, { error: 'invalid_web_vital' })
    if (metricName === 'cls' && metricValue > 100) return json(400, { error: 'invalid_cls' })
  } else if (metricName || metricValue !== undefined) {
    return json(400, { error: 'metric_not_allowed' })
  }

  if (eventType === 'save_action' && (!operation || !new Set(['insert', 'update']).has(operation))) return json(400, { error: 'invalid_save_operation' })
  if (eventType === 'file_transfer' && (!operation || !new Set(['upload', 'download', 'delete']).has(operation))) return json(400, { error: 'invalid_file_operation' })
  if (eventType === 'auth_action' && (!operation || !new Set(['login', 'logout', 'refresh']).has(operation))) return json(400, { error: 'invalid_auth_operation' })
  if (eventType === 'edge_function' && (!operation || !new Set(['index-document', 'invite-user']).has(operation))) return json(400, { error: 'invalid_edge_operation' })
  if (!new Set(['save_action', 'file_transfer', 'auth_action', 'edge_function']).has(eventType) && operation) return json(400, { error: 'operation_not_allowed' })

  const client = serviceClient()
  if (!client) return json(503, { error: 'telemetry_store_unavailable' })

  const { error } = await client.rpc('record_operational_metric', {
    p_event_type: eventType,
    p_surface: surface,
    p_outcome: outcome,
    p_operation: operation || '',
    p_route_family: routeFamily,
    p_http_status: httpStatus ?? null,
    p_build_sha: buildSha || '',
    p_duration_ms: durationMs ?? null,
    p_metric_name: metricName || '',
    p_metric_value: metricValue ?? null,
  })

  if (error) {
    console.error(JSON.stringify({ kind: 'SYMMEDIS_OPERATION_STORE_FAILURE', event_type: eventType, operation: operation || '', code: error.code || 'unknown' }))
    return json(503, { error: 'telemetry_store_failed' })
  }

  console.log(JSON.stringify({
    kind: 'SYMMEDIS_OPERATION',
    event_type: eventType,
    surface,
    outcome,
    route_family: routeFamily,
    duration_ms: durationMs,
    http_status: httpStatus,
    build_sha: buildSha,
    operation,
    metric_name: metricName,
    metric_value: metricValue,
    observed_at: new Date().toISOString(),
  }))
  return json(202, { ok: true })
})
