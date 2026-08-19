import { readFile } from 'node:fs/promises'

const FIXTURE_PROJECT_ID = 'a551b1c8-55d0-4a90-8897-1408e7a08bac'
const RESET_CONFIRMATION = 'RESET_SYMMEDIS_E2E'
const failures = []

async function text(path) { return readFile(path, 'utf8') }
function requireText(content, value, label) {
  if (!content.includes(value)) failures.push(`${label}: fehlt: ${value}`)
}

const [fn, script, workflow] = await Promise.all([
  text('supabase/functions/e2e-fixture/index.ts'),
  text('scripts/mutating-browser-e2e.mjs'),
  text('.github/workflows/mutating-e2e.yml'),
])

for (const value of [FIXTURE_PROJECT_ID, RESET_CONFIRMATION, 'FIXTURE_VERSION = 1', 'fixture_version', 'allow_mutating_e2e', 'e2e_fixture', 'STAFF_ROLES']) {
  requireText(fn, value, 'e2e-fixture function')
}
for (const value of [
  FIXTURE_PROJECT_ID,
  RESET_CONFIRMATION,
  "const preflight = await fixture(cdp, 'reset'",
  'Fixture vor Testbeginn selbstheilend zurückgesetzt',
  "await fixture(cdp, 'reset'",
  'finally {',
  'Report über UI finalisiert',
  'Dokument über UI hochgeladen',
  'Aufgabenstatus über UI persistiert',
]) {
  requireText(script, value, 'mutating browser E2E')
}
for (const value of ["vars.E2E_MUTATING == 'true'", 'workflow_dispatch:', 'scripts/mutating-browser-e2e.mjs', 'E2E_STAFF_EMAIL', 'E2E_STAFF_PASSWORD', 'cancel-in-progress: false']) {
  requireText(workflow, value, 'mutating E2E workflow')
}

if (/service[_-]?role|SUPABASE_SERVICE_ROLE_KEY/i.test(script) || /service[_-]?role|SUPABASE_SERVICE_ROLE_KEY/i.test(workflow)) {
  failures.push('Mutating E2E: Service-Role-Secrets dürfen weder Browser-Script noch Workflow erreichen.')
}
if (!/projectId !== FIXTURE_PROJECT_ID/.test(fn)) failures.push('e2e-fixture function muss fremde Project-IDs hart ablehnen.')
if (!/project\.metadata\?\.e2e_fixture === true/.test(fn)) failures.push('e2e-fixture function muss den Fixture-Metadatenvertrag prüfen.')
if (!/Number\(project\.metadata\?\.fixture_version\) === FIXTURE_VERSION/.test(fn)) failures.push('e2e-fixture function muss die Fixture-Version hart prüfen.')

if (failures.length) {
  console.error('\nSYMMEDIS E2E Fixture Guard: FEHLGESCHLAGEN\n')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('SYMMEDIS E2E Fixture Guard: OK')
console.log('✓ Mutierende E2E-Tests sind auf das dedizierte Staging-Fixture begrenzt')
console.log('✓ Fixture wird vor und nach jedem Lauf selbstheilend zurückgesetzt')
console.log('✓ Fixture-Version ist gegen stilles Schema-/Daten-Drift gesperrt')
console.log('✓ Service-Role-Secrets bleiben außerhalb von Browser und GitHub-Workflow')
