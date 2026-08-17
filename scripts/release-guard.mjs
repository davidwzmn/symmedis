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

// Browser code must never contain privileged Supabase credentials or server-only secrets.
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

// Real analysis must stay on the authenticated Edge Function path.
const analysisRunPanel = await text('src/components/modules/AnalysisRunPanel.jsx')
if (!analysisRunPanel.includes("from '../../lib/analysisRunApi.js'")) {
  fail('AnalysisRunPanel muss den authentifizierten analysisRunApi-Pfad verwenden.')
}
if (analysisRunPanel.includes('requestAnalysis')) {
  fail('AnalysisRunPanel darf den Legacy-/Demo-Client requestAnalysis nicht verwenden.')
}

// Legacy demo API must fail closed unless a caller opts into local demo behavior.
const legacyApi = await text('src/lib/api.js')
for (const signature of [
  'allowDemoFallback === true',
  'if (!darfDemoFallback(options)) throw produktFehler(error)',
  'Es wurden keine Demo-Ergebnisse als echte Daten eingesetzt.',
]) {
  if (!legacyApi.includes(signature)) fail(`src/lib/api.js: Release-Guard fehlt: ${signature}`)
}

// Every browser caller of the legacy demo API must opt in explicitly.
for (const [path, content] of source) {
  if (path === 'src/lib/api.js') continue
  const importsLegacyApi = content.includes("from '../../lib/api.js'") || content.includes("from '../lib/api.js'") || content.includes("from './lib/api.js'")
  if (!importsLegacyApi) continue
  const callsLegacy = content.includes('requestAnalysis(') || content.includes('requestChatReply(')
  if (callsLegacy && !content.includes('allowDemoFallback: true')) {
    fail(`${path}: Legacy-Demo-API wird ohne explizites allowDemoFallback verwendet.`)
  }
}

// Portal routes must remain behind the authenticated workspace gate and demo must stay separate.
const app = await text('src/App.jsx')
for (const routeGuard of [
  '<Route path="/demo/*" element={<DemoApp />} />',
  '<Route path="/portal/*" element={<WorkspaceGate><CustomerApp /></WorkspaceGate>} />',
  '<Route path="/intern/*" element={<WorkspaceGate><StaffApp /></WorkspaceGate>} />',
]) {
  if (!app.includes(routeGuard)) fail(`src/App.jsx: geschützte Routing-Grenze fehlt oder wurde verändert: ${routeGuard}`)
}

// Public launch must remain explicit opt-in in the documented environment template.
const envExample = await text('.env.example')
if (!envExample.includes('VITE_PUBLIC_LAUNCH=false')) {
  fail('.env.example: öffentliche Indexierung muss standardmäßig deaktiviert bleiben.')
}
if (/VITE_[A-Z0-9_]*(SECRET|SERVICE_ROLE|ANTHROPIC_API_KEY)/.test(envExample)) {
  fail('.env.example: Server-Secrets dürfen nicht mit VITE_ veröffentlicht werden.')
}

if (failures.length) {
  console.error('\nSYMMEDIS Release Guard: FEHLGESCHLAGEN\n')
  failures.forEach((message) => console.error(`- ${message}`))
  process.exit(1)
}

console.log(`SYMMEDIS Release Guard: OK (${sourceFiles.length} Browser-Quelldateien geprüft)`)
console.log('✓ Keine privilegierten Server-Secrets im Browser-Code')
console.log('✓ Echte Analyse bleibt auf authentifiziertem Edge-Function-Pfad')
console.log('✓ Demo-Fallback ist explizites Opt-in')
console.log('✓ Demo-, Kunden- und Staff-Routen bleiben getrennt')
console.log('✓ Öffentliche Indexierung bleibt explizites Opt-in')
