import { readFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = process.cwd()
const failures = []

function fail(message) {
  failures.push(message)
}

async function text(path) {
  return readFile(join(root, path), 'utf8')
}

async function walk(dir) {
  const absolute = join(root, dir)
  const entries = await readdir(absolute, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(absolute, entry.name)
    if (entry.isDirectory()) files.push(...await walk(relative(root, full)))
    else files.push(relative(root, full))
  }
  return files
}

const sourceFiles = (await walk('src')).filter((path) => /\.(js|jsx|ts|tsx)$/.test(path))
const source = await Promise.all(sourceFiles.map(async (path) => [path, await text(path)]))
const migrationFiles = (await walk('supabase/migrations')).filter((path) => path.endsWith('.sql'))
const migrations = await Promise.all(migrationFiles.map(async (path) => [path, await text(path)]))
const migrationCorpus = migrations.map(([, content]) => content).join('\n\n')

const forbiddenBrowserPatterns = [
  ['SUPABASE_SERVICE_ROLE_KEY', 'Supabase service-role secret name'],
  ['service_role', 'Supabase service-role credential'],
  ['ANTHROPIC_API_KEY', 'Anthropic server secret'],
  ['SUPABASE_SECRET_KEY', 'Supabase secret key'],
]
for (const [path, content] of source) {
  for (const [pattern, label] of forbiddenBrowserPatterns) {
    if (content.includes(pattern)) fail(`${path}: ${label} darf nicht im Browser-Code vorkommen.`)
  }
}

const analysisRunPanel = await text('src/components/modules/AnalysisRunPanel.jsx')
if (!analysisRunPanel.includes("from '../../lib/analysisRunApi.js'")) fail('AnalysisRunPanel muss den authentifizierten analysisRunApi-Pfad verwenden.')
if (analysisRunPanel.includes('requestAnalysis')) fail('AnalysisRunPanel darf den Legacy-/Demo-Client requestAnalysis nicht verwenden.')

const legacyApi = await text('src/lib/api.js')
for (const signature of [
  'allowDemoFallback === true',
  'if (!darfDemoFallback(options)) throw produktFehler(error)',
  'Es wurden keine Demo-Ergebnisse als echte Daten eingesetzt.',
]) {
  if (!legacyApi.includes(signature)) fail(`src/lib/api.js: Release-Guard fehlt: ${signature}`)
}

for (const [path, content] of source) {
  if (path === 'src/lib/api.js') continue
  const importsLegacyApi = content.includes("from '../../lib/api.js'") || content.includes("from '../lib/api.js'") || content.includes("from './lib/api.js'")
  if (!importsLegacyApi) continue
  const callsLegacy = content.includes('requestAnalysis(') || content.includes('requestChatReply(')
  if (callsLegacy && !content.includes('allowDemoFallback: true')) fail(`${path}: Legacy-Demo-API wird ohne explizites allowDemoFallback verwendet.`)
}

const app = await text('src/App.jsx')
const routeGuards = [
  ['Demo', '<Route path="/demo/*" element={<DemoWorkspaceProvider><Deferred><DemoApp /></Deferred></DemoWorkspaceProvider>} />'],
  ['Customer', '<Route path="/portal/*" element={<WorkspaceGate><Deferred><CustomerApp /></Deferred></WorkspaceGate>} />'],
  ['Staff', '<Route path="/intern/*" element={<WorkspaceGate><Deferred><StaffApp /></Deferred></WorkspaceGate>} />'],
]
for (const [label, routeGuard] of routeGuards) {
  if (!app.includes(routeGuard)) fail(`src/App.jsx: ${label}-Routing-Grenze fehlt oder wurde verändert: ${routeGuard}`)
}
for (const signature of [
  "const DemoApp = lazyNamed(() => import('./pages/demo/DemoApp.jsx'), 'DemoApp')",
  "const CustomerApp = lazyNamed(() => import('./pages/customer/CustomerApp.jsx'), 'CustomerApp')",
  "const StaffApp = lazyNamed(() => import('./pages/staff/StaffApp.jsx'), 'StaffApp')",
]) {
  if (!app.includes(signature)) fail(`src/App.jsx: erwartete sichere Route-Code-Splitting-Signatur fehlt: ${signature}`)
}
if (!app.includes('<AppErrorBoundary>')) fail('Recovery: Die Anwendung muss von einem globalen Render-Error-Boundary geschützt bleiben.')

const demoWorkspace = await text('src/state/DemoWorkspaceProvider.jsx')
for (const signature of ['createWorkspace()', 'echteDaten: false', "workspaceFuerUser: 'demo'"]) {
  if (!demoWorkspace.includes(signature)) fail(`Demo-Isolation: erwartete lokale Workspace-Signatur fehlt: ${signature}`)
}
if (/fetchWorkspace|accessToken|persist[A-Z]|supabase/i.test(demoWorkspace)) fail('Demo-Isolation: Der öffentliche DemoWorkspaceProvider darf keine produktive Persistenz oder Supabase-Session verwenden.')

const homePage = await text('src/pages/marketing/HomePage.jsx')
for (const signature of [
  'Wachstum stockt selten wegen mangelnder Aktivität. Meist fehlt die richtige Diagnose.',
  'variant="cta"',
  'Mehr Aktivität löst kein strukturelles Wachstumsproblem.',
  'Menschliche Freigabe statt Blackbox',
  'Plattform ansehen',
  'Portal-Login',
  '15 Minuten · keine Verkaufsrunde · klare Einschätzung',
  'variant="on-dark-secondary"',
  '<TeamSection />',
]) {
  if (!homePage.includes(signature)) fail(`Homepage: erwartete Premium-Hierarchie fehlt: ${signature}`)
}
if (/bg-\[#[0-9a-fA-F]{3,8}\]/.test(homePage)) fail('Homepage: rohe Hex-Hintergründe dürfen die Design-Tokens nicht umgehen.')
if (homePage.includes('Strategic Growth Intelligence')) fail('Homepage: redundante englische Hero-Metaebene darf nicht zurückkehren.')

const marketingContent = await text('src/content/marketing.js')
if (!marketingContent.includes("frage: 'Was brauchen wir von Ihnen?'")) fail('FAQ: die kundenorientierte Formulierung „Was brauchen wir von Ihnen?“ muss erhalten bleiben.')

const primitives = await text('src/components/ui/primitives.jsx')
for (const signature of ["'on-dark':", "'on-dark-secondary':", 'bg-cta text-on-cta', 'bg-transparent text-canvas border border-canvas/30']) {
  if (!primitives.includes(signature)) fail(`CTA-Kontrast: erwartete Dark-CTA-Hierarchie fehlt: ${signature}`)
}

const topbar = await text('src/components/shell/Topbar.jsx')
for (const signature of ['Zur Website', 'Abmelden', "window.location.assign('/')"]) {
  if (!topbar.includes(signature)) fail(`Portal-Navigation: erwartete sichere Rückkehr-/Logout-Signatur fehlt: ${signature}`)
}

const staffDashboard = await text('src/pages/staff/StaffDashboard.jsx')
for (const signature of ['Heute wichtig', 'Arbeitsfokus', 'Freigaben prüfen', 'Überfällige Aufgaben', 'Kundenanfragen', 'Neue Dokumente']) {
  if (!staffDashboard.includes(signature)) fail(`Mitarbeiterportal: Arbeitsfokus darf nicht regressieren: ${signature}`)
}

const projectDashboard = await text('src/components/modules/ProjectDashboard.jsx')
for (const signature of ['Auf einen Blick', 'Wo stehen wir, was bremst, was jetzt?', 'Wo stehen wir?', 'Was bremst?', 'Was jetzt?']) {
  if (!projectDashboard.includes(signature)) fail(`Kundenportal: Executive Snapshot darf nicht regressieren: ${signature}`)
}

const authE2e = await text('scripts/auth-browser-e2e.mjs')
for (const signature of [
  "const REQUIRE_AUTH = process.env.E2E_REQUIRE_AUTH === 'true'",
  "{ path: '/intern/aufgaben'",
  "{ path: '/intern/freigaben'",
  "{ path: '/intern/dokumente'",
  "{ path: '/intern/posteingang'",
  "{ path: '/portal/aufgaben'",
  "{ path: '/portal/dokumente'",
  "{ path: '/portal/berichte'",
  "{ path: '/portal/nachrichten'",
  'Kernnavigation vollständig erreichbar',
]) {
  if (!authE2e.includes(signature)) fail(`Browser-E2E: Rollen-/Navigationsvertrag fehlt: ${signature}`)
}

const ciWorkflow = await text('.github/workflows/ci.yml')
for (const signature of [
  'uses: actions/configure-pages@v5',
  'uses: actions/upload-pages-artifact@v4',
  'uses: actions/deploy-pages@v4',
  'pages: read',
  'pages: write',
  'id-token: write',
  'name: github-pages',
  'symmedis/live-staging',
  "E2E_REQUIRE_AUTH: ${{ vars.E2E_REQUIRE_AUTH || 'false' }}",
]) {
  if (!ciWorkflow.includes(signature)) fail(`Release-Infrastruktur: offizieller GitHub-Pages-/E2E-Vertrag fehlt: ${signature}`)
}
if (/push\s+(?:--force\s+)?origin\s+HEAD:gh-pages/.test(ciWorkflow)) {
  fail('Release-Infrastruktur: GitHub Actions darf nicht wieder per Bot-Push auf gh-pages deployen; Pages muss über deploy-pages laufen.')
}
if (ciWorkflow.includes('Publish live staging to gh-pages')) {
  fail('Release-Infrastruktur: der alte gh-pages-Bot-Publish-Schritt darf nicht zurückkehren.')
}

const growthVisual = await text('src/pages/marketing/GrowthSystemVisual.jsx')
for (const signature of ['BEISPIEL · DIAGNOSE', 'Mehrere Quellen bestätigt', 'Nächster Schritt']) {
  if (!growthVisual.includes(signature)) fail(`Homepage-Visual: erwartete reduzierte Diagnose-Darstellung fehlt: ${signature}`)
}
if (/text-\[0\.(?:[0-5][0-9])rem\]/.test(growthVisual)) fail('Homepage-Visual: Mikroschrift unter ca. 10px darf nicht zurückkehren.')
if (/bg-\[#[0-9a-fA-F]{3,8}\]/.test(growthVisual)) fail('Homepage-Visual: rohe Hex-Hintergründe dürfen die Design-Tokens nicht umgehen.')

const marketingParts = await text('src/pages/marketing/parts.jsx')
for (const signature of ['submitWebsiteLead', "source: 'website-diagnosegespraech'", 'website: form.website']) {
  if (!marketingParts.includes(signature)) fail(`Öffentliche Anfrage: produktiver Lead-Vertrag fehlt: ${signature}`)
}
if (marketingParts.includes('Demo-Formular:') || marketingParts.includes('es wurde nichts versendet')) fail('Öffentliche Anfrage: Das Terminformular darf keinen Demo-Schein-Erfolg mehr anzeigen.')

const serverApi = await text('server/api.mjs')
for (const signature of [
  "process.env.SYMMEDIS_AI_ENABLED === 'true'",
  'AI_ENABLED && (API_KEY || AUTH_TOKEN)',
  "if (!aiConfigured) throw new Error('ai_disabled')",
]) {
  if (!serverApi.includes(signature)) fail(`AI-Kostengrenze: Preview-Server muss explizit fail-closed bleiben: ${signature}`)
}

const envExample = await text('.env.example')
if (!envExample.includes('VITE_PUBLIC_LAUNCH=false')) fail('.env.example: öffentliche Indexierung muss standardmäßig deaktiviert bleiben.')
if (/VITE_[A-Z0-9_]*(SECRET|SERVICE_ROLE|ANTHROPIC_API_KEY)/.test(envExample)) fail('.env.example: Server-Secrets dürfen nicht mit VITE_ veröffentlicht werden.')

const requiredMigrationGuards = [
  ['guard_customer_task_update()', 'Kunden dürfen nur den Aufgabenstatus ändern'],
  ["if profile_role = 'kunde'", 'Customer-Task-Guard muss rollenabhängig bleiben'],
  ['guard_customer_document_registration()', 'Kunden-Uploads müssen serverseitig registriert werden'],
  ["v_profile.role <> 'kunde'", 'Dokument-Guard muss Kundenzugänge separat behandeln'],
  ['snapshot_final_report()', 'Finale Reports müssen unveränderlich versioniert werden'],
  ["'report.version_published'", 'Finale Report-Freigaben müssen auditierbar bleiben'],
  ['report_versions_read', 'Report-Versionen brauchen expliziten Lesezugriff per RLS'],
  ["report_versions.state = 'final'", 'Kunden dürfen nur finale Report-Versionen sehen'],
  ['symmedis_project_files_insert', 'Projektdateien brauchen tenantgebundene Storage-Insert-Policy'],
  ['symmedis_project_files_delete_unregistered_customer', 'Customer-Rollback darf nur unregistrierte eigene Uploads löschen'],
  ['revoke all privileges on all tables in schema public from anon', 'Anon darf keine direkten fachlichen Tabellenrechte erhalten'],
  ['revoke truncate, references, trigger on all tables in schema public from authenticated', 'Authenticated darf keine DDL-nahen Tabellenrechte erhalten'],
]
for (const [signature, label] of requiredMigrationGuards) {
  if (!migrationCorpus.includes(signature)) fail(`Datenintegrität: ${label} – erwartete Migration-Signatur fehlt: ${signature}`)
}

const dangerousReportVersionGrant = /grant\s+(?:all|insert|update|delete|truncate)(?:\s+privileges)?\s+on\s+(?:table\s+)?public\.report_versions\s+to\s+(?:anon|authenticated)/i
if (dangerousReportVersionGrant.test(migrationCorpus)) fail('Datenintegrität: report_versions darf keine Browser-Schreibrechte erhalten.')

for (const fn of ['snapshot_final_report()', 'guard_customer_document_registration()']) {
  const revokePattern = new RegExp(`revoke\\s+all\\s+on\\s+function\\s+(?:private\\.)?${fn.replace(/[()]/g, '\\$&')}\\s+from\\s+[^;]*public`, 'i')
  if (!revokePattern.test(migrationCorpus)) fail(`Datenintegrität: privilegierte Funktion ${fn} muss explizit von PUBLIC entzogen sein.`)
}

if (failures.length) {
  console.error('\nSYMMEDIS Release Guard: FEHLGESCHLAGEN\n')
  failures.forEach((message) => console.error(`- ${message}`))
  process.exit(1)
}

console.log(`SYMMEDIS Release Guard: OK (${sourceFiles.length} Browser-Quelldateien, ${migrationFiles.length} Migrationen geprüft)`)
console.log('✓ Keine privilegierten Server-Secrets im Browser-Code')
console.log('✓ Echte Analyse bleibt auf authentifiziertem Edge-Function-Pfad')
console.log('✓ Demo-Fallback ist explizites Opt-in und eigener Workspace')
console.log('✓ Demo-/Customer-/Staff-Routen bleiben geschützt und code-gesplittet')
console.log('✓ Homepage-Hierarchie, CTA-Logik und menschliche Freigabe bleiben geschützt')
console.log('✓ Portal-Rückkehr, Logout, Staff-Arbeitsfokus und Customer-Executive-Snapshot bleiben geschützt')
console.log('✓ Authentifizierter Zwei-Rollen-E2E prüft geschützte Kernnavigation')
console.log('✓ Offizieller GitHub-Pages-Deploypfad und Live-Staging-Status bleiben geschützt')
console.log('✓ Globaler Render-Recovery-Pfad bleibt aktiv')
console.log('✓ Optionale KI bleibt auch im Preview-Server explizit kosten-gesperrt')
console.log('✓ Customer-Task-, Dokument-, Report- und Storage-Guards bleiben versioniert')
console.log('✓ Least-Privilege-Grants bleiben versioniert')
