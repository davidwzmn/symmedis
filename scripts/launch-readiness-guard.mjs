import fs from 'node:fs'

function read(path) {
  if (!fs.existsSync(path)) throw new Error(`Launch readiness guard: ${path} fehlt.`)
  return fs.readFileSync(path, 'utf8')
}
function requireText(content, needle, label) {
  if (!content.includes(needle)) throw new Error(`Launch readiness guard: ${label} fehlt.`)
}

const baseMigration = read('supabase/migrations/20260820083400_launch_and_pilot_readiness_gates.sql')
const adminMigration = read('supabase/migrations/20260820085100_restrict_launch_gate_manual_writes_to_admins.sql')
const strictMigration = read('supabase/migrations/20260820085230_require_verified_external_launch_evidence.sql')
const edge = read('supabase/functions/auth-email-evidence/index.ts')
const session = read('src/state/SessionProvider.jsx')
const api = read('src/lib/launchReadinessApi.js')
const card = read('src/components/modules/LaunchReadinessCard.jsx')

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

requireText(session, "invokeEdgeFunction('auth-email-evidence'", 'automatische Customer-Session-Verifikation')
requireText(api, "['custom_smtp', 'restore_drill']", 'nur manuell zulässige Gates')
requireText(card, "const MANUAL_GATES = new Set(['custom_smtp', 'restore_drill'])", 'UI ohne manuelle Invite/Login-Freigabe')
requireText(card, 'Nachweis als verifiziert speichern', 'explizite Admin-Verifikation')
requireText(card, 'session?.istAdmin', 'Admin-only UI')

console.log('Launch readiness guard passed.')
