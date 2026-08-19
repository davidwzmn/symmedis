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
const pagesMode = process.env.SYMMEDIS_STANDALONE === 'true'

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const assetUrlPattern = (file) => `[^"']*/assets/${escapeRegExp(file)}`

let html = readFileSync(join(DIST, 'index.html'), 'utf8')
const dateien = readdirSync(ASSETS)

if (pagesMode && !html.includes('/symmedis/assets/')) {
  console.error('FEHLER: Pages-Standalone-Build wurde nicht mit der erwarteten Vite-Basis /symmedis/ erzeugt.')
  process.exit(1)
}

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
  const fontUrl = new RegExp(`url\\((?:["']?)${assetUrlPattern(fontName)}(?:["']?)\\)`, 'g')
  css = css.replace(fontUrl, `url(data:font/woff2;base64,${font})`)
}

const cssTag = new RegExp(`<link[^>]+href="${assetUrlPattern(cssName)}"[^>]*>`)
const jsTag = new RegExp(`<script[^>]+src="${assetUrlPattern(jsName)}"[^>]*></script>`)

if (!cssTag.test(html) || !jsTag.test(html)) {
  console.error('FEHLER: CSS-/JS-Bundle konnte im Standalone-HTML nicht base-path-neutral gefunden werden.')
  process.exit(1)
}

html = html.replace(cssTag, () => `<style>${css}</style>`)
html = html.replace(jsTag, () => `<script type="module">${js}</script>`)
html = html.replace('<head>', `<head>\n    <meta name="symmedis-build" content="${buildSha}">`)

if (/(?:href|src)="[^"]*\/assets\//.test(html) || /import\(["']\.\/[^"']+\.js["']\)/.test(html)) {
  console.error('FEHLER: Standalone-HTML enthält noch externe oder dynamische JS-Asset-Verweise.')
  process.exit(1)
}
if (!html.includes(`name="symmedis-build" content="${buildSha}"`)) {
  console.error('FEHLER: Build-Marker konnte nicht eingebettet werden.')
  process.exit(1)
}

writeFileSync(ziel, html)
console.log(`Standalone geschrieben: ${ziel} (${(html.length / 1024).toFixed(0)} kB, build ${buildSha.slice(0, 12)})`)
