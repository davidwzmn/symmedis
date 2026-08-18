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
if (homePage.includes('bg-[#f2f5fa]')) fail('Homepage: fest heller Hintergrund #f2f5fa kollidiert mit Dark-Mode-Texttokens.')
const growthVisual = await text('src/pages/marketing/GrowthSystemVisual.jsx')
for (const signature of ['aspect-square', 'sm:aspect-[1.05]', "mobile: 'Aktivierung'", 'shrink-0']) {
  if (!growthVisual.includes(signature)) fail(`Homepage-Mobile: Diagnosis Graph Guard fehlt: ${signature}`)
}

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
console.log('✓ Homepage-/Mobile- und öffentliches Lead-Formular bleiben geschützt')
console.log('✓ Globaler Render-Recovery-Pfad bleibt aktiv')
console.log('✓ Optionale KI bleibt auch im Preview-Server explizit kosten-gesperrt')
console.log('✓ Customer-Task-, Dokument-, Report- und Storage-Guards bleiben versioniert')
console.log('✓ Least-Privilege-Grants bleiben versioniert')
