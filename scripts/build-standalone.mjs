/**
 * Erzeugt eine eigenständige Single-File-Ausspielung der Plattform.
 *
 * Voraussetzung: vorher `VITE_ROUTER=hash npm run build -- --outDir dist-hash`.
 * Dieses Skript inlined CSS, JS und die Schriftdatei (als data-URI) aus
 * dist-hash in eine einzige HTML-Datei ohne externe Requests – geeignet für
 * statisches Hosting (z. B. GitHub Pages) und für den Versand als eine Datei.
 *
 * Aufruf:  node scripts/build-standalone.mjs [ziel.html]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist-hash'
const ASSETS = join(DIST, 'assets')
const ziel = process.argv[2] || 'symmedis-plattform.html'

let html = readFileSync(join(DIST, 'index.html'), 'utf8')
const dateien = readdirSync(ASSETS)

const cssName = dateien.find((f) => f.endsWith('.css'))
const jsName = dateien.find((f) => f.endsWith('.js'))
const fontName = dateien.find((f) => f.endsWith('.woff2'))

let css = readFileSync(join(ASSETS, cssName), 'utf8')
const js = readFileSync(join(ASSETS, jsName), 'utf8')

// Schrift als data-URI einbetten, damit keine externe Anfrage nötig ist.
if (fontName) {
  const font = readFileSync(join(ASSETS, fontName)).toString('base64')
  css = css.replaceAll(
    `url(/assets/${fontName})`,
    `url(data:font/woff2;base64,${font})`,
  )
}

// <link rel=stylesheet …> → inline <style>
html = html.replace(
  new RegExp(`<link[^>]+href="/assets/${cssName}"[^>]*>`),
  () => `<style>${css}</style>`,
)
// <script type=module src=…> → inline <script type=module>
html = html.replace(
  new RegExp(`<script[^>]+src="/assets/${jsName}"[^>]*></script>`),
  () => `<script type="module">${js}</script>`,
)

// Sicherstellen, dass keine externen Asset-Requests übrig bleiben.
if (/(?:href|src)="\/assets\//.test(html)) {
  console.error('FEHLER: Es verbleiben externe Asset-Verweise im HTML.')
  process.exit(1)
}

writeFileSync(ziel, html)
console.log(`Standalone geschrieben: ${ziel} (${(html.length / 1024).toFixed(0)} kB)`)
