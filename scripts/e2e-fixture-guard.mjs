import { readFile } from 'node:fs/promises'

const FIXTURE_PROJECT_ID = 'a551b1c8-55d0-4a90-8897-1408e7a08bac'
const STAFF_TASK_ID = '72e4af65-806c-44ad-9e03-4f5393a97d19'
const CUSTOMER_TASK_ID = '9d0d9f33-0ce2-4b8c-9d67-4f27791913c5'
const ANALYSIS_ITEM_ID = '63e6f8df-c28b-4cc2-9a72-dc9750746f0e'
const RESET_CONFIRMATION = 'RESET_SYMMEDIS_E2E'
const failures = []

async function text(path) { return readFile(path, 'utf8') }
function requireText(content, value, label) {
  if (!content.includes(value)) failures.push(`${label}: fehlt: ${value}`)
}

const [fn, crossRoleScript, crossRoleWorkflow, oidcBootstrap, authBrowserE2e, customerDocumentMigration] = await Promise.all([
  text('supabase/functions/e2e-fixture/index.ts'),
  text('scripts/cross-role-browser-e2e.mjs'),
  text('.github/workflows/cross-role-e2e.yml'),
  text('supabase/functions/e2e-auth-bootstrap/index.ts'),
  text('scripts/auth-browser-e2e.mjs'),
  text('supabase/migrations/20260819142842_harden_customer_document_registration_and_rollback.sql'),
])

for (const value of [
  FIXTURE_PROJECT_ID, STAFF_TASK_ID, CUSTOMER_TASK_ID, ANALYSIS_ITEM_ID, RESET_CONFIRMATION,
  'FIXTURE_VERSION = 1', 'fixture_version', 'allow_mutating_e2e', 'e2e_fixture', 'STAFF_ROLES',
  'delete().eq("project_id", FIXTURE_PROJECT_ID)', 'fixture.tasks.length === 2',
  'fixture.analysis.length === 1', 'analysisItem?.approval_status === "intern"', 'analysisItem?.customer_visible === false',
  'const ALLOWED_ORIGINS = new Set([', '"https://davidwzmn.github.io"', '"http://127.0.0.1:4176"',
  'ALLOWED_ORIGINS.has(origin) ? origin : "https://davidwzmn.github.io"',
  '"Access-Control-Allow-Methods": "POST, OPTIONS"',
  'admin.from("reports").select("id,title,state,report_date").eq("project_id", FIXTURE_PROJECT_ID).order("report_date").order("id")',
]) {
  requireText(fn, value, 'e2e-fixture function')
}
if (/Access-Control-Allow-Origin["']?\s*:\s*["']\*["']/.test(fn)) {
  failures.push('e2e-fixture function: Wildcard-CORS darf nicht verwendet werden.')
}
if (/from\(["']reports["']\)[^\n]*order\(["']created_at["']\)/.test(fn)) {
  failures.push('e2e-fixture function: Reports besitzen kein created_at; Fixture-Inspect darf nicht danach sortieren.')
}

for (const value of [
  STAFF_TASK_ID, CUSTOMER_TASK_ID, ANALYSIS_ITEM_ID,
  'Staff-Aufgabenstatus über spaltenbeschränktes RLS-Update persistiert und auditierbar',
  'Human-Review-Finding kontrolliert für den Kunden freigegeben',
  'Internes Staff-Dokument hochgeladen und authentifiziert wieder heruntergeladen',
  'Customer-E2E: SYMMEDIS-Aufgabe ist für Kunden nicht read-only.',
  'Kunde sieht ausschließlich das durch Human Review freigegebene Finding',
  'Customer Upload/Download funktioniert; internes Staff-Dokument bleibt für Kunden unsichtbar',
  'Staff finalisiert Report; unveränderliche Version wurde erzeugt',
  'Kunde sieht nach Reload exakt den finalisierten Report und die archivierte Version',
  "await fixture(staff.cdp, 'reset'", 'finally {',
]) {
  requireText(crossRoleScript, value, 'cross-role browser E2E')
}

for (const value of [
  'id-token: write', 'statuses: write', 'workflow_dispatch:', 'npm run build', 'scripts/cross-role-browser-e2e.mjs',
  'scripts/auth-browser-e2e.mjs', 'E2E_REQUIRE_AUTH="true"', 'symmedis-auth-e2e.log',
  'ACTIONS_ID_TOKEN_REQUEST_URL', 'ACTIONS_ID_TOKEN_REQUEST_TOKEN', 'audience=symmedis-e2e-bootstrap',
  'functions/v1/e2e-auth-bootstrap', '\\"action\\":\\"bootstrap\\"', '\\"action\\":\\"cleanup\\"',
  'GITHUB_RUN_ID', 'cancel-in-progress: false', 'Record pending cross-role release status', 'Record cross-role release status',
  'state:"pending"', 'symmedis/cross-role-e2e', 'actions/runs/${GITHUB_RUN_ID}', 'statuses/${GITHUB_SHA}',
]) {
  requireText(crossRoleWorkflow, value, 'cross-role E2E workflow')
}
if (/secrets\.E2E_(?:STAFF|CUSTOMER)/.test(crossRoleWorkflow)) failures.push('Cross-Role-E2E: dauerhafte Staff-/Customer-Passwort-Secrets dürfen nicht zurückkehren.')

for (const value of [
  'const expectedBase = new URL(`${BASE_URL}/`)',
  'finalUrl.origin !== expectedBase.origin',
  'finalUrl.pathname !== expectedBase.pathname',
  'Logout hat die App-Basis verlassen',
  'Kernnavigation vollständig per UI erreichbar',
]) {
  requireText(authBrowserE2e, value, 'secretless auth browser E2E')
}

for (const value of [
  'https://token.actions.githubusercontent.com', '.well-known/jwks',
  'EXPECTED_AUDIENCE = "symmedis-e2e-bootstrap"', 'EXPECTED_REPOSITORY_ID = "1314992444"',
  'EXPECTED_REF = "refs/heads/agent/supabase-auth-foundation"',
  'EXPECTED_WORKFLOW_REF = "davidwzmn/symmedis/.github/workflows/cross-role-e2e.yml@refs/heads/agent/supabase-auth-foundation"',
  'claims?.repository_visibility !== "public"', 'claims?.runner_environment !== "github-hosted"',
  'header?.alg !== "RS256"', 'crypto.subtle.verify', 'Number(project.metadata?.fixture_version) !== FIXTURE_VERSION',
  '@example.invalid', 'email_confirm: true', 'admin.auth.admin.createUser', 'admin.auth.admin.deleteUser',
  'AUTH_PAGE_SIZE = 1000', 'admin.auth.admin.listUsers({ page, perPage: AUTH_PAGE_SIZE })',
  'user.app_metadata?.e2e_fixture !== true', 'String(user.app_metadata?.e2e_run_id || "") !== runId',
  'existing_e2e_auth_identity_safety_mismatch', 'expectedEmails.has(user.email)',
  'if (deleteError) throw deleteError', 'profileDeleteError',
]) {
  requireText(oidcBootstrap, value, 'E2E OIDC Bootstrap')
}

for (const value of [
  'new.source := \'kunde\'',
  'new.customer_visible := true',
  'v_project_client <> v_profile.client_id',
  'v_parts[1] <> v_profile.client_id::text',
  'v_parts[2] <> new.project_id::text',
  'v_object_owner is distinct from auth.uid()::text',
  'symmedis_project_files_select_unregistered_customer_cleanup',
  'owner_id = (select auth.uid()::text)',
  "p.role = 'kunde'",
  'not exists (\n    select 1\n    from public.documents d\n    where d.storage_path = objects.name',
]) {
  requireText(customerDocumentMigration, value, 'customer document registration/rollback migration')
}
if (/for select[\s\S]*symmedis_project_files_select_unregistered_customer_cleanup[\s\S]*customer_visible/i.test(customerDocumentMigration)) {
  failures.push('Customer-Dokument-Rollback: Cleanup-SELECT darf nicht von einem bereits registrierten kundensichtbaren Dokument abhängen.')
}

const authDeleteIndex = oidcBootstrap.indexOf('await admin.auth.admin.deleteUser(user.id)')
const profileDeleteIndex = oidcBootstrap.indexOf('.from("profiles")\n        .delete()', authDeleteIndex)
if (authDeleteIndex < 0 || profileDeleteIndex < 0 || profileDeleteIndex < authDeleteIndex) {
  failures.push('E2E OIDC Bootstrap: Cleanup muss Auth-Identitäten vor Profilen löschen, damit Orphans erneut auffindbar bleiben.')
}

if (/service[_-]?role|SUPABASE_SERVICE_ROLE_KEY/i.test(crossRoleScript) || /service[_-]?role|SUPABASE_SERVICE_ROLE_KEY/i.test(crossRoleWorkflow) || /service[_-]?role|SUPABASE_SERVICE_ROLE_KEY/i.test(authBrowserE2e)) {
  failures.push('E2E: Service-Role-Secrets dürfen weder Browser-Skripte noch GitHub-Workflow erreichen.')
}
if (!/SUPABASE_SERVICE_ROLE_KEY/.test(oidcBootstrap)) failures.push('OIDC Bootstrap: privilegierter Auth-Admin-Zugriff muss ausschließlich serverseitig in der Edge Function liegen.')
if (!/projectId !== FIXTURE_PROJECT_ID/.test(fn)) failures.push('e2e-fixture function muss fremde Project-IDs hart ablehnen.')
if (!/project\.metadata\?\.e2e_fixture === true/.test(fn)) failures.push('e2e-fixture function muss den Fixture-Metadatenvertrag prüfen.')
if (!/Number\(project\.metadata\?\.fixture_version\) === FIXTURE_VERSION/.test(fn)) failures.push('e2e-fixture function muss die Fixture-Version hart prüfen.')

if (failures.length) {
  console.error('\nSYMMEDIS E2E Fixture Guard: FEHLGESCHLAGEN\n')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('SYMMEDIS E2E Fixture Guard: OK')
console.log('✓ Eine einzige kanonische secretlose Cross-Role-E2E-Strecke ist maßgeblich')
console.log('✓ Fixture rekonstruiert Staff-/Customer-Aufgaben, Human-Review-Finding und Draft-Report deterministisch')
console.log('✓ Fixture-CORS ist auf öffentliche Staging-Origin und exakten lokalen CI-Origin begrenzt; kein Wildcard-CORS')
console.log('✓ Fixture-Report-Inspect sortiert ausschließlich über reale, stabile Spalten')
console.log('✓ Customer-Uploads werden serverseitig kanonisiert; fehlgeschlagene Registrierungen bleiben eng begrenzt aufräumbar')
console.log('✓ Cross-Role-E2E prüft Staff Task, Human Review, interne Dokumentprivacy, Customer Task/Upload/Download und Report-Handover')
console.log('✓ Dieselben OIDC-Identitäten prüfen zusätzlich Portal-Navigation und sicheren Logout')
console.log('✓ Cross-Role-Identitäten entstehen kurzlebig per GitHub OIDC statt aus Passwort-Secrets')
console.log('✓ OIDC ist auf Repo-ID, Branch, Workflow, Audience und GitHub-hosted Runner begrenzt')
console.log('✓ OIDC-Cleanup findet Auth-Orphans direkt und löscht nur exakt run-gebundene Fixture-Identitäten')
console.log('✓ Cross-Role-Ergebnis wird pending/success/failure als symmedis/cross-role-e2e Commit-Status veröffentlicht')
console.log('✓ Service-Role-Secrets bleiben außerhalb von Browser und GitHub-Workflow')
