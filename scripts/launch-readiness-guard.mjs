import fs from 'node:fs'

function read(path) {
  if (!fs.existsSync(path)) throw new Error(`Launch readiness guard: ${path} fehlt.`)
  return fs.readFileSync(path, 'utf8')
}
function requireText(content, needle, label) {
  if (!content.includes(needle)) throw new Error(`Launch readiness guard: ${label} fehlt.`)
}
function forbidText(content, needle, label) {
  if (content.includes(needle)) throw new Error(`Launch readiness guard: veralteter Vertrag '${label}' ist noch vorhanden.`)
}

const baseMigration = read('supabase/migrations/20260820083400_launch_and_pilot_readiness_gates.sql')
const adminMigration = read('supabase/migrations/20260820085100_restrict_launch_gate_manual_writes_to_admins.sql')
const strictMigration = read('supabase/migrations/20260820085230_require_verified_external_launch_evidence.sql')
const edge = read('supabase/functions/auth-email-evidence/index.ts')
const invite = read('supabase/functions/invite-user/index.ts')
const supabaseClient = read('src/lib/supabase.js')
const session = read('src/state/SessionProvider.jsx')
const api = read('src/lib/launchReadinessApi.js')
const card = read('src/components/modules/LaunchReadinessCard.jsx')
const settings = read('src/pages/staff/SettingsPage.jsx')
const runbook = read('docs/release/PRODUCTION_LAUNCH_RUNBOOK.md')

for (const [needle, label] of [
  ['launch_gate_evidence', 'persistente Launch-Nachweise'],
  ['enable row level security', 'RLS'],
  ['get_launch_readiness', 'Launch-Readiness-RPC'],
  ['leaked_password_protection', 'Leaked-Password-Gate'],
  ['custom_smtp', 'SMTP-Gate'],
  ['real_invite_delivery', 'Invite-Zustellungs-Gate'],
  ['real_magic_link_login', 'Magic-Link-Gate'],
  ['restore_drill', 'Restore-Gate'],
]) requireText(baseMigration, needle, label)

requireText(adminMigration, "me.role = 'admin'", 'Admin-only manuelle Writes')
requireText(strictMigration, "else coalesce(e.status, 'pending') = 'verified'", 'verified-only externe Gates')
requireText(strictMigration, "gate_key = 'leaked_password_protection'", 'separate Leaked-Password-Semantik')

for (const [needle, label] of [
  ['EMAIL_AUTH_METHODS', 'E-Mail-AMR-Prüfung'],
  ['access.invited', 'Produkt-Invite-Audit'],
  ['@example.invalid', 'Synthetic-Identity-Ausschluss'],
  ['real_invite_delivery', 'automatischer Invite-Nachweis'],
  ['real_magic_link_login', 'automatischer Login-Nachweis'],
  ['launch.email_auth_verified', 'Audit des realen Auth-Nachweises'],
  ['userResponse.ok', 'serverseitige Sessionvalidierung'],
  ['req.method === "OPTIONS"', 'Browser-CORS-Preflight'],
]) requireText(edge, needle, label)

for (const [needle, label] of [
  ['https://davidwzmn.github.io/symmedis/', 'kanonische produktive Invite-URL'],
  ['NON_PRODUCTION_EMAIL_DOMAINS', 'serverseitige Sperre synthetischer Kundenadressen'],
  ['example.invalid', 'Sperre der E2E-Testdomain'],
  ['example.com', 'Sperre reservierter Beispiel-Domain'],
  ['example.org', 'Sperre reservierter Beispiel-Domain'],
  ['example.net', 'Sperre reservierter Beispiel-Domain'],
  ['inviteUserByEmail', 'produktiver Supabase-Invite'],
  ['redirectTo:', 'expliziter Invite-Redirect'],
]) requireText(invite, needle, label)

for (const [needle, label] of [
  ["const DEFAULT_APP_URL = 'https://davidwzmn.github.io/symmedis/'", 'kanonische produktive Frontend-URL'],
  ['const AUTH_REDIRECT_URL = APP_URL', 'gemeinsame Auth-Redirect-Quelle'],
  ['redirect_to: AUTH_REDIRECT_URL', 'Magic-Link auf produktive App-URL'],
  ['create_user: false', 'kein implizites Benutzer-Anlegen via Magic Link'],
]) requireText(supabaseClient, needle, label)

requireText(session, "invokeEdgeFunction('auth-email-evidence'", 'automatische Customer-Session-Verifikation')
requireText(api, "['custom_smtp', 'restore_drill']", 'nur manuell zulässige Gates')
requireText(card, "const MANUAL_GATES = new Set(['custom_smtp', 'restore_drill'])", 'UI ohne manuelle Invite/Login-Freigabe')
requireText(card, 'Nachweis als verifiziert speichern', 'explizite Admin-Verifikation')
requireText(card, 'session?.istAdmin', 'Admin-only UI')
for (const [needle, label] of [
  ['const nextGate = openGates[0] || null', 'dynamische Priorisierung des nächsten offenen Gates'],
  ['Als Nächstes: Custom SMTP produktiv konfigurieren', 'SMTP als nächster konkreter Schritt'],
  ['Site URL und erlaubte Redirect-URLs', 'Auth-Redirect-Hinweis'],
  ['Link-Tracking beim Mailprovider deaktivieren', 'Schutz vor veränderten Auth-Links'],
  ['Keine @example.invalid-Adresse verwenden', 'reale Mailbox statt E2E-Identität'],
  ['kosten- oder betriebsrelevante Restore-Aktion', 'Restore-Kosten-/Betriebsgrenze'],
]) requireText(card, needle, label)

for (const [needle, label] of [
  ['Technische Release Readiness', 'separate technische Readiness'],
  ['{RELEASE_GATES.length}/{RELEASE_GATES.length} technisch abgesichert', 'dynamische vollständige technische Readiness'],
  ['Externe Produktionsnachweise separat', 'separate externe Produktionsnachweise'],
  ['Bezahlte KI ist kein Pflichtgate', 'KI nicht als Pflichtgate'],
  ['Customer-Login → freigegebenes Finding', 'technisch abgesicherter Customer-E2E'],
]) requireText(settings, needle, label)
for (const [needle, label] of [
  ['Staff- und Customer-Browser-E2E sowie die kontrollierte KI-Aktivierung', 'alte offene Browser-/KI-Gate-Aussage'],
  ['erfordert eine sichere echte Testadresse', 'alte Vermischung von technischem E2E und realer Mail-Evidenz'],
]) forbidText(settings, needle, label)

for (const [needle, label] of [
  ['Custom SMTP / Absenderdomain', 'SMTP-Runbook'],
  ['Link-Tracking beim SMTP-/Mailprovider', 'Link-Tracking-Schutz im Runbook'],
  ['Enterprise-Mail-Security-Test', 'Enterprise-Mailscanner-Test'],
  ['OTP oder einen eigenen Zwischen-Link', 'Scanner-resistenter Fallback'],
  ['auth-email-evidence', 'automatischer realer Mail-Nachweis im Runbook'],
  ['@example.invalid', 'Ausschluss synthetischer Identitäten im Runbook'],
  ['docs/RECOVERY_RUNBOOK.md', 'Recovery-Verweis'],
  ['Keine SMTP-Credentials', 'Secret-Hygiene'],
  ['3-5 reale Pilotprojekte', 'Pilot-Handoff nach Launch'],
]) requireText(runbook, needle, label)

console.log('Launch readiness guard passed.')
