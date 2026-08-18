/**
 * Erzeugt eine eigenständige Single-File-Ausspielung der Plattform.
 *
 * Voraussetzung: vorher `VITE_ROUTER=hash npm run build -- --outDir dist-hash`.
 * Dieses Skript inlined CSS, JS und die Schriftdatei (als data-URI) aus
 * dist-hash in eine einzige HTML-Datei ohne externe Requests.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist-hash'
const ASSETS = join(DIST, 'assets')
const ziel = process.argv[2] || 'symmedis-plattform.html'
const buildSha = (process.env.GITHUB_SHA || process.env.SYMMEDIS_BUILD_SHA || 'local').trim()

let html = readFileSync(join(DIST, 'index.html'), 'utf8')
const dateien = readdirSync(ASSETS)

const cssName = dateien.find((f) => f.endsWith('.css'))
const jsName = dateien.find((f) => f.endsWith('.js'))
const fontName = dateien.find((f) => f.endsWith('.woff2'))

if (!cssName || !jsName) {
  console.error('FEHLER: CSS- oder JavaScript-Bundle fehlt im Hash-Build.')
  process.exit(1)
}

let css = readFileSync(join(ASSETS, cssName), 'utf8')
const js = readFileSync(join(ASSETS, jsName), 'utf8')

if (fontName) {
  const font = readFileSync(join(ASSETS, fontName)).toString('base64')
  css = css.replaceAll(`url(/assets/${fontName})`, `url(data:font/woff2;base64,${font})`)
}

html = html.replace(
  new RegExp(`<link[^>]+href="/assets/${cssName}"[^>]*>`),
  () => `<style>${css}</style>`,
)
html = html.replace(
  new RegExp(`<script[^>]+src="/assets/${jsName}"[^>]*></script>`),
  () => `<script type="module">${js}</script>`,
)

// Maschinenlesbarer Marker für den Live-Smoke-Test. Enthält keine Secrets.
html = html.replace('<head>', `<head>\n    <meta name="symmedis-build" content="${buildSha}">`)

if (/(?:href|src)="\/assets\//.test(html)) {
  console.error('FEHLER: Es verbleiben externe Asset-Verweise im HTML.')
  process.exit(1)
}
if (!html.includes(`name="symmedis-build" content="${buildSha}"`)) {
  console.error('FEHLER: Build-Marker konnte nicht eingebettet werden.')
  process.exit(1)
}

writeFileSync(ziel, html)
console.log(`Standalone geschrieben: ${ziel} (${(html.length / 1024).toFixed(0)} kB, build ${buildSha.slice(0, 12)})`)
