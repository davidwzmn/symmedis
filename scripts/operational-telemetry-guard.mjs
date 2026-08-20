import { readFile } from 'node:fs/promises'

const files = {
  supabase: await readFile('src/lib/supabase.js', 'utf8'),
  telemetry: await readFile('src/lib/operationalTelemetry.js', 'utf8'),
  main: await readFile('src/main.jsx', 'utf8'),
  boundary: await readFile('src/components/system/AppErrorBoundary.jsx', 'utf8'),
  edge: await readFile('supabase/functions/operational-telemetry/index.ts', 'utf8'),
}

const failures = []
const requireText = (source, text, label) => {
  if (!source.includes(text)) failures.push(`${label}: ${text}`)
}
const forbidText = (source, text, label) => {
  if (source.includes(text)) failures.push(`${label}: unerlaubtes Feld ${text}`)
}

for (const event of ['render_failure', 'workspace_load', 'save_action', 'file_transfer', 'web_vital']) {
  requireText(files.edge, `'${event}'`, `Edge Function kennt Event nicht`)
}
for (const metric of ['lcp', 'cls', 'inp']) {
  requireText(files.edge, `'${metric}'`, `Edge Function kennt Web Vital nicht`)
  requireText(files.telemetry, `'${metric}'`, `Frontend misst Web Vital nicht`)
}

requireText(files.main, 'installOperationalTelemetry()', 'Telemetry wird nicht beim App-Start installiert')
requireText(files.boundary, 'recordRenderFailure()', 'Render Error Boundary meldet keine Failure')
requireText(files.telemetry, "eventType: 'workspace_load'", 'Workspace Load Event fehlt')
requireText(files.supabase, "trackedOperation('save_action', 'insert'", 'Insert-Save-Telemetrie fehlt')
requireText(files.supabase, "trackedOperation('save_action', 'update'", 'Update-Save-Telemetrie fehlt')
requireText(files.supabase, "trackedOperation('file_transfer', 'upload'", 'Upload-Telemetrie fehlt')
requireText(files.supabase, "trackedOperation('file_transfer', 'download'", 'Download-Telemetrie fehlt')
requireText(files.supabase, "trackedOperation('file_transfer', 'delete'", 'Delete-Telemetrie fehlt')
requireText(files.edge, "kind: 'SYMMEDIS_OPERATION'", 'Strukturierter Log-Marker fehlt')
requireText(files.edge, "return json(202, { ok: true })", 'Telemetry-Accept-Vertrag fehlt')
requireText(files.supabase, 'keepalive: true', 'Pagehide-Telemetrie ist nicht keepalive-fähig')
requireText(files.supabase, "trace: false", 'Telemetry/Edge-Aufruf schützt nicht gegen Trace-Rekursion')

const payloadBlock = files.supabase.slice(files.supabase.indexOf('const payload = {'), files.supabase.indexOf('return fetch(`${SUPABASE_URL}${TELEMETRY_FUNCTION}`'))
for (const sensitive of ['projectId', 'clientId', 'userId', 'email', 'message', 'description', 'path:', 'table:']) {
  forbidText(payloadBlock, sensitive, 'Telemetry-Payload')
}
for (const sensitive of ['project_id', 'client_id', 'user_id', 'email', 'message:', 'description:', 'payload:', 'body,']) {
  forbidText(files.edge.slice(files.edge.indexOf('const event = {')), sensitive, 'Telemetry-Log')
}

if (files.edge.includes('console.log(body') || files.edge.includes('console.log(JSON.stringify(body')) {
  failures.push('Edge Function darf den Roh-Payload nicht loggen')
}

if (failures.length) {
  console.error('Operational-Telemetry-Guard verletzt:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('✓ Operational telemetry privacy + event contracts protected')
