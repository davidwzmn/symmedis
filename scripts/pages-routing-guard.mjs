import { readFile } from 'node:fs/promises'

const failures = []
const text = (path) => readFile(path, 'utf8')
const requireText = (content, value, label) => {
  if (!content.includes(value)) failures.push(`${label}: fehlt: ${value}`)
}

const [vite, topbar, sessionProvider, authE2e, standaloneBuilder, ci] = await Promise.all([
  text('vite.config.js'),
  text('src/components/shell/Topbar.jsx'),
  text('src/state/SessionProvider.jsx'),
  text('scripts/auth-browser-e2e.mjs'),
  text('scripts/build-standalone.mjs'),
  text('.github/workflows/ci.yml'),
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

const logoutStart = sessionProvider.indexOf('const abmelden')
const clearIndex = sessionProvider.indexOf('clearSession()', logoutStart)
const remoteIndex = sessionProvider.indexOf('await signOut(accessToken)', logoutStart)
if (logoutStart < 0 || clearIndex < 0 || remoteIndex < 0 || clearIndex > remoteIndex) {
  failures.push('Logout Reihenfolge: lokale Session muss vor Remote-Sign-out gelöscht werden.')
}

for (const value of [
  'const expectedBase = new URL(`${BASE_URL}/`)',
  'finalUrl.origin !== expectedBase.origin',
  'finalUrl.pathname !== expectedBase.pathname',
  'Logout hat die App-Basis verlassen',
]) requireText(authE2e, value, 'Auth Browser E2E')
if (authE2e.includes('PLACEHOLDER')) failures.push('Auth Browser E2E: Platzhalter darf nicht committed sein.')

for (const value of [
  'const pagesMode = process.env.SYMMEDIS_STANDALONE === \'true\'',
  'const assetUrlPattern = (file)',
  "html.includes('/symmedis/assets/')",
  'CSS-/JS-Bundle konnte im Standalone-HTML nicht base-path-neutral gefunden werden.',
  'Standalone-HTML enthält noch externe oder dynamische JS-Asset-Verweise.',
]) requireText(standaloneBuilder, value, 'Standalone Pages Builder')

for (const value of [
  'VITE_ROUTER: hash',
  "SYMMEDIS_STANDALONE: 'true'",
  'node scripts/build-standalone.mjs pages-index.html dist-pages',
  'https://davidwzmn.github.io/symmedis/',
]) requireText(ci, value, 'GitHub Pages CI')

if (/secrets\.E2E_(?:STAFF|CUSTOMER)/.test(ci)) failures.push('GitHub Pages CI: langlebige E2E-Passwort-Secrets dürfen nicht zurückkehren.')

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
console.log('✓ Standalone-Builder inlined Assets unabhängig vom Vite-Base-Prefix')
console.log('✓ Haupt-CI bleibt frei von langlebigen E2E-Passwort-Secrets')
console.log('✓ Browser-E2E prüft den tatsächlichen Basis-Pfad statt hart / zu erwarten')
