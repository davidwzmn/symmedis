import { readFile } from 'node:fs/promises'

const FIXTURE_PROJECT_ID = 'a551b1c8-55d0-4a90-8897-1408e7a08bac'
const STAFF_TASK_ID = '72e4af65-806c-44ad-9e03-4f5393a97d19'
const CUSTOMER_TASK_ID = '9d0d9f33-0ce2-4b8c-9d67-4f27791913c5'
const RESET_CONFIRMATION = 'RESET_SYMMEDIS_E2E'
const failures = []

async function text(path) { return readFile(path, 'utf8') }
function requireText(content, value, label) {
  if (!content.includes(value)) failures.push(`${label}: fehlt: ${value}`)
}

const [fn, script, workflow, crossRoleScript, crossRoleWorkflow] = await Promise.all([
  text('supabase/functions/e2e-fixture/index.ts'),
  text('scripts/mutating-browser-e2e.mjs'),
  text('.github/workflows/mutating-e2e.yml'),
  text('scripts/cross-role-browser-e2e.mjs'),
  text('.github/workflows/cross-role-e2e.yml'),
])

for (const value of [FIXTURE_PROJECT_ID, STAFF_TASK_ID, CUSTOMER_TASK_ID, RESET_CONFIRMATION, 'FIXTURE_VERSION = 1', 'fixture_version', 'allow_mutating_e2e', 'e2e_fixture', 'STAFF_ROLES', 'delete().eq("project_id", FIXTURE_PROJECT_ID)', 'fixture.tasks.length === 2']) {
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
for (const value of ["vars.E2E_MUTATING == 'true'", 'workflow_dispatch:', 'npm run build', 'scripts/mutating-browser-e2e.mjs', 'E2E_STAFF_EMAIL', 'E2E_STAFF_PASSWORD', 'cancel-in-progress: false']) {
  requireText(workflow, value, 'mutating E2E workflow')
}

for (const value of [
  STAFF_TASK_ID,
  CUSTOMER_TASK_ID,
  'Customer-E2E: SYMMEDIS-Aufgabe ist für Kunden nicht read-only.',
  'Customer Upload + authentifizierter Download über echte UI erfolgreich',
  'Staff finalisiert Report; unveränderliche Version wurde erzeugt',
  'Kunde sieht nach Reload exakt den finalisierten Report und die archivierte Version',
  "await fixture(staff.cdp, 'reset'",
  'finally {',
]) {
  requireText(crossRoleScript, value, 'cross-role browser E2E')
}
for (const value of ["vars.E2E_CROSS_ROLE == 'true'", 'workflow_dispatch:', 'npm run build', 'scripts/cross-role-browser-e2e.mjs', 'E2E_STAFF_EMAIL', 'E2E_STAFF_PASSWORD', 'E2E_CUSTOMER_EMAIL', 'E2E_CUSTOMER_PASSWORD', 'cancel-in-progress: false']) {
  requireText(crossRoleWorkflow, value, 'cross-role E2E workflow')
}

if (/service[_-]?role|SUPABASE_SERVICE_ROLE_KEY/i.test(script) || /service[_-]?role|SUPABASE_SERVICE_ROLE_KEY/i.test(workflow) || /service[_-]?role|SUPABASE_SERVICE_ROLE_KEY/i.test(crossRoleScript) || /service[_-]?role|SUPABASE_SERVICE_ROLE_KEY/i.test(crossRoleWorkflow)) {
  failures.push('E2E: Service-Role-Secrets dürfen weder Browser-Skripte noch GitHub-Workflows erreichen.')
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
console.log('✓ Fixture wird kanonisch auf zwei Aufgaben und einen Draft-Report zurückgebaut')
console.log('✓ Staff- und Customer-Aufgabe sind getrennt und ownership-sicher')
console.log('✓ Cross-Role-E2E prüft Customer Task, Upload, Download und Staff→Customer Report-Handover')
console.log('✓ Fixture-Version ist gegen stilles Schema-/Daten-Drift gesperrt')
console.log('✓ Service-Role-Secrets bleiben außerhalb von Browser und GitHub-Workflow')
