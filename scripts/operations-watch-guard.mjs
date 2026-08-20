import { readFile } from 'node:fs/promises'

const failures = []
const workflow = await readFile('.github/workflows/operations-watch.yml', 'utf8')
const evaluator = await readFile('scripts/operations-health.mjs', 'utf8')
const runbook = await readFile('docs/INCIDENT_RUNBOOK.md', 'utf8')

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) failures.push(`${label}: ${needle}`)
}

for (const signature of [
  "cron: '17 */6 * * *'",
  'actions: read',
  'statuses: write',
  'symmedis/operations-health',
  'SYMMEDIS_HEALTH_MIN_SUCCESS_RATE:',
  "'0.95'",
  'SYMMEDIS_HEALTH_MAX_AGE_HOURS:',
  "'48'",
  "SYMMEDIS_HEALTH_ENFORCE_HISTORY: ${{ github.event_name == 'schedule' }}",
  'retention-days: 90',
]) requireText(workflow, signature, 'Operations workflow contract missing')

for (const signature of [
  "workflowHealth('ci.yml')",
  "workflowHealth('cross-role-e2e.yml')",
  'livePageHealth()',
  'leadIngressHealth()',
  'telemetryAuthWallHealth()',
  'response.status === 401',
  "website: 'operations-watch-honeypot'",
  "SYMMEDIS_HEALTH_ENFORCE_HISTORY === 'true'",
]) requireText(evaluator, signature, 'Operations evaluator contract missing')

for (const forbidden of [
  'SUPABASE_SERVICE_ROLE_KEY',
  'service_role',
  'ANTHROPIC_API_KEY',
  'customer_id',
  'project_id',
  'email:',
]) {
  if (evaluator.includes(forbidden)) failures.push(`Operations evaluator must stay privacy-safe and secretless: ${forbidden}`)
}

for (const signature of [
  'SEV-1 — Trust / Security',
  'SEV-2 — Kernreise gestört',
  'SEV-3 — Degradation',
  'docs/RECOVERY_RUNBOOK.md',
  'Keine Release-Gates abschalten',
  '95 %',
  '48 Stunden',
]) requireText(runbook, signature, 'Incident runbook contract missing')

if (failures.length) {
  console.error('SYMMEDIS Operations Watch Guard: FEHLGESCHLAGEN')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('SYMMEDIS Operations Watch Guard: OK')
console.log('✓ Scheduled health evaluation and commit status are protected')
console.log('✓ CI/E2E history, live staging, lead ingress and telemetry auth wall are covered')
console.log('✓ History threshold is enforced on schedule but not allowed to poison PR validation')
console.log('✓ 90-day machine-readable health artifacts are retained')
console.log('✓ Operations evaluator stays secretless and privacy-safe')
console.log('✓ Incident severity and recovery escalation remain documented')
