/**
 * Minimaler Produktions-Server (ohne Fremd-Abhängigkeiten):
 * liefert den Build aus /dist und bedient dieselben /api-Routen wie der
 * Vite-Dev-Server.
 *
 *   npm run build && npm run preview
 */

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { aiConfigured, handleApiRequest } from './api.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const PORT = Number(process.env.PORT) || 4173
const HOST = process.env.HOST || '0.0.0.0'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

function sendFile(res, filePath, status = 200) {
  const ext = path.extname(filePath).toLowerCase()
  const stream = fs.createReadStream(filePath)

  stream.on('error', () => {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Interner Serverfehler')
  })

  res.statusCode = status
  res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream')
  res.setHeader(
    'Cache-Control',
    filePath.includes(`${path.sep}assets${path.sep}`)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
  )
  stream.pipe(res)
}

const server = http.createServer(async (req, res) => {
  if (await handleApiRequest(req, res)) return

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  const requested = decodeURIComponent((req.url || '/').split('?')[0])
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, '')
  const candidate = path.join(DIST, safePath)

  if (!candidate.startsWith(DIST)) {
    res.statusCode = 403
    res.end('Forbidden')
    return
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    sendFile(res, candidate)
    return
  }

  // One-Pager: alles Übrige auf index.html
  const indexFile = path.join(DIST, 'index.html')
  if (!fs.existsSync(indexFile)) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Kein Build gefunden. Bitte zuerst "npm run build" ausführen.')
    return
  }
  sendFile(res, indexFile, safePath === '/' || safePath === '\\' ? 200 : 404)
})

server.listen(PORT, HOST, () => {
  console.log(`\n  SYMMEDIS Diagnosis OS – Demo läuft auf http://localhost:${PORT}`)
  console.log(
    `  Anthropic-API: ${aiConfigured ? 'konfiguriert' : 'nicht konfiguriert (lokales Demo-Modell aktiv)'}\n`,
  )
})
