/**
 * Erzeugt eine eigenständige Single-File-Ausspielung der Plattform.
 *
 * Voraussetzung: vorher einen Hash-Router-Build mit SYMMEDIS_STANDALONE=true
 * erzeugen. In diesem Spezialbuild werden dynamische Imports bewusst wieder
 * zu einem JS-Bundle zusammengeführt; der normale Produktionsbuild bleibt
 * weiterhin route-basiert code-gesplittet.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ziel = process.argv[2] || 'symmedis-plattform.html'
const DIST = process.argv[3] || 'dist-hash'
const ASSETS = join(DIST, 'assets')
const buildSha = (process.env.GITHUB_SHA || process.env.SYMMEDIS_BUILD_SHA || 'local').trim()

let html = readFileSync(join(DIST, 'index.html'), 'utf8')
const dateien = readdirSync(ASSETS)

const cssFiles = dateien.filter((file) => file.endsWith('.css'))
const jsFiles = dateien.filter((file) => file.endsWith('.js'))
const fontName = dateien.find((file) => file.endsWith('.woff2'))

if (cssFiles.length !== 1 || jsFiles.length !== 1) {
  console.error(`FEHLER: Standalone-Build erwartet exakt ein CSS- und ein JS-Bundle, gefunden: CSS=${cssFiles.length}, JS=${jsFiles.length}.`)
  console.error('Hinweis: Vite muss dafür mit SYMMEDIS_STANDALONE=true gebaut werden.')
  process.exit(1)
}

const [cssName] = cssFiles
const [jsName] = jsFiles
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

html = html.replace('<head>', `<head>\n    <meta name="symmedis-build" content="${buildSha}">`)

if (/(?:href|src)="\/assets\//.test(html) || /import\(["']\.\/[^"']+\.js["']\)/.test(html)) {
  console.error('FEHLER: Standalone-HTML enthält noch externe oder dynamische JS-Asset-Verweise.')
  process.exit(1)
}
if (!html.includes(`name="symmedis-build" content="${buildSha}"`)) {
  console.error('FEHLER: Build-Marker konnte nicht eingebettet werden.')
  process.exit(1)
}

writeFileSync(ziel, html)
console.log(`Standalone geschrieben: ${ziel} (${(html.length / 1024).toFixed(0)} kB, build ${buildSha.slice(0, 12)})`)
