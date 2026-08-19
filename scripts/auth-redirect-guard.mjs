import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/lib/supabase.js', import.meta.url), 'utf8')
const failures = []

function requireSignature(signature, message) {
  if (!source.includes(signature)) failures.push(message)
}

requireSignature("const AUTH_REDIRECT_URL = APP_URL", 'Magic-Link-Redirect muss auf die kanonische App-URL zeigen.')
requireSignature("raw.split(/[?#]/).reverse().find((part) => part.includes('access_token=') && part.includes('refresh_token='))", 'Auth-Redirect muss Supabase access_token und refresh_token auch im Hash-Router sicher erkennen.')
requireSignature("const accessToken = params.get('access_token')", 'Auth-Redirect muss den Access Token lesen.')
requireSignature("const refreshToken = params.get('refresh_token')", 'Auth-Redirect muss den Refresh Token lesen.')
requireSignature("window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))", 'Auth-Session muss vor dem Routing lokal persistiert werden.')
requireSignature("const clean = `${window.location.pathname}${window.location.search}#/login`", 'Nach Token-Konsum muss der URL-Hash auf die Login-Route bereinigt werden.')
requireSignature("window.history.replaceState(null, '', clean)", 'Auth-Tokens dürfen nach erfolgreichem Konsum nicht in der sichtbaren URL verbleiben.')
requireSignature("create_user: false", 'Magic-Link-Anforderung darf keine unbekannten Benutzer automatisch anlegen.')
requireSignature("redirect_to: AUTH_REDIRECT_URL", 'Magic-Link-Anforderung muss den freigegebenen Redirect explizit mitsenden.')

if (source.includes("console.log(accessToken)") || source.includes("console.log(refreshToken)")) {
  failures.push('Auth-Tokens dürfen niemals geloggt werden.')
}

if (failures.length) {
  console.error('Auth redirect guard failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Auth redirect guard passed: Magic-Link-/Invite-Tokenkonsum, URL-Bereinigung und create_user=false sind geschützt.')
