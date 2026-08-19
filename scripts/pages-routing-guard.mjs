import { readFile } from 'node:fs/promises'

const failures = []
const text = (path) => readFile(path, 'utf8')
const requireText = (content, value, label) => {
  if (!content.includes(value)) failures.push(`${label}: fehlt: ${value}`)
}

const [vite, topbar, sessionProvider, authE2e] = await Promise.all([
  text('vite.config.js'),
  text('src/components/shell/Topbar.jsx'),
  text('src/state/SessionProvider.jsx'),
  text('scripts/auth-browser-e2e.mjs'),
])

for (const value of [
  "const publicBase = standalone ? '/symmedis/' : '/'",
  'base: publicBase',
]) requireText(vite, value, 'Vite Pages Base')

for (const value of [
  "import { Link } from 'react-router-dom'",
  "const PUBLIC_HOME_URL = import.meta.env.BASE_URL || '/'",
  'href={PUBLIC_HOME_URL}',
  'window.location.assign(PUBLIC_HOME_URL)',
  '<Link to={item.to}',
  'await abmelden()',
]) requireText(topbar, value, 'Portal Navigation')

if (topbar.includes('href="/"')) failures.push('Portal Navigation: rohe Domain-Root-Links dürfen nicht zurückkehren.')
if (topbar.includes("window.location.assign('/')")) failures.push('Portal Navigation: Logout darf nicht auf die Domain-Wurzel springen.')
if (topbar.includes('<a href={item.to}')) failures.push('Breadcrumb: interne Portalpfade müssen router-nativ bleiben.')

for (const value of [
  'const accessToken = authSession?.access_token || null',
  'clearSession()',
  'await signOut(accessToken)',
]) requireText(sessionProvider, value, 'Logout Reihenfolge')

const clearIndex = sessionProvider.indexOf('clearSession()', sessionProvider.indexOf('const abmelden'))
const remoteIndex = sessionProvider.indexOf('await signOut(accessToken)', sessionProvider.indexOf('const abmelden'))
if (clearIndex < 0 || remoteIndex < 0 || clearIndex > remoteIndex) {
  failures.push('Logout Reihenfolge: lokale Session muss vor Remote-Sign-out gelöscht werden.')
}

for (const value of [
  'const expectedBase = new URL(`${BASE_URL}/`)',
  'finalUrl.origin !== expectedBase.origin',
  'finalUrl.pathname !== expectedBase.pathname',
  'Logout hat die App-Basis verlassen',
]) requireText(authE2e, value, 'Auth Browser E2E')

if (authE2e.includes('PLACEHOLDER')) failures.push('Auth Browser E2E: Platzhalter darf nicht committed sein.')

if (failures.length) {
  console.error('\nSYMMEDIS Pages Routing Guard: FEHLGESCHLAGEN\n')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('SYMMEDIS Pages Routing Guard: OK')
console.log('✓ GitHub Pages nutzt explizit /symmedis/ als öffentliche App-Basis')
console.log('✓ Portal-Rückkehr und Logout bleiben innerhalb der deployten App-Basis')
console.log('✓ Lokale Session wird vor Best-Effort-Remote-Sign-out gelöscht')
console.log('✓ Breadcrumbs nutzen React-Router statt dokumentweiter Root-Navigation')
console.log('✓ Browser-E2E prüft den tatsächlichen Basis-Pfad statt hart / zu erwarten')
