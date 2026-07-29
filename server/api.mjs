/**
 * API-Schicht der SYMMEDIS-Demo.
 *
 * Wird von zwei Stellen benutzt:
 *  - vite.config.js  → Dev-Server-Middleware (`npm run dev`)
 *  - server/index.mjs → Produktions-Server (`npm run preview`)
 *
 * Der API-Key steht ausschließlich in der Umgebung (ANTHROPIC_API_KEY) und
 * verlässt den Server nie. Fehlt er oder schlägt der Upstream-Call fehl,
 * antwortet der Server mit dem lokalen Demo-Modell – die Demo bleibt damit
 * unter allen Umständen benutzbar.
 */

import {
  ANALYSE_SYSTEM_PROMPT,
  BRANCHEN,
  CHAT_SYSTEM_PROMPT,
  buildAnalyseUserPrompt,
  buildFallbackAnalysis,
  buildFallbackChatReply,
  normalizeAnalysis,
} from '../src/lib/analysis.js'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'
const MAX_TOKENS = 1000
const BASE_URL = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/+$/, '')
const API_KEY = process.env.ANTHROPIC_API_KEY || ''
const AUTH_TOKEN = process.env.ANTHROPIC_AUTH_TOKEN || ''
const UPSTREAM_TIMEOUT_MS = 45_000
const MAX_BODY_BYTES = 64 * 1024

const BRANCHEN_IDS = new Set(BRANCHEN.map((b) => b.id))

export const aiConfigured = Boolean(API_KEY || AUTH_TOKEN)

/* ------------------------------------------------------------------ *
 * HTTP-Hilfsfunktionen
 * ------------------------------------------------------------------ */

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Length', Buffer.byteLength(body))
  res.end(body)
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('payload_too_large'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('error', reject)
    req.on('end', () => {
      if (chunks.length === 0) return resolve({})
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(Object.assign(new Error('invalid_json'), { status: 400 }))
      }
    })
  })
}

/* ------------------------------------------------------------------ *
 * Anthropic-Aufruf
 * ------------------------------------------------------------------ */

function authHeaders() {
  if (API_KEY) return { 'x-api-key': API_KEY }
  return {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'anthropic-beta': 'oauth-2025-04-20',
  }
}

/**
 * Ruft die Anthropic Messages API auf und gibt den zusammengesetzten Text
 * zurück. Wirft bei Timeout, Netzwerk- oder API-Fehlern.
 */
async function callAnthropic({ system, messages }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}/v1/messages`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        ...authHeaders(),
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages,
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw Object.assign(new Error(`upstream_${response.status}`), {
        status: response.status,
        detail: detail.slice(0, 500),
      })
    }

    const data = await response.json()

    if (data.stop_reason === 'refusal') {
      throw Object.assign(new Error('upstream_refusal'), { status: 422 })
    }

    const text = (data.content ?? [])
      .filter((block) => block?.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim()

    if (!text) throw new Error('empty_response')
    return text
  } finally {
    clearTimeout(timer)
  }
}

function logUpstreamFailure(route, error) {
  const reason = error?.name === 'AbortError' ? 'timeout' : error?.message || 'unknown'
  console.warn(`[symmedis] ${route}: Anthropic-Aufruf fehlgeschlagen (${reason}) → Demo-Modell`)
}

/* ------------------------------------------------------------------ *
 * Validierung
 * ------------------------------------------------------------------ */

function validateAnalyseInput(body) {
  const branche = typeof body?.branche === 'string' ? body.branche : ''
  const situation = typeof body?.situation === 'string' ? body.situation.trim() : ''

  if (!BRANCHEN_IDS.has(branche)) {
    return { error: 'Bitte wählen Sie eine Branche aus.' }
  }
  if (situation.length < 10) {
    return { error: 'Bitte beschreiben Sie Ihre Situation in mindestens 10 Zeichen.' }
  }
  if (situation.length > 1500) {
    return { error: 'Bitte fassen Sie sich etwas kürzer (max. 1500 Zeichen).' }
  }
  return { value: { branche, situation } }
}

function validateChatInput(body) {
  const raw = Array.isArray(body?.messages) ? body.messages : null
  if (!raw || raw.length === 0) {
    return { error: 'Es wurde keine Nachricht übermittelt.' }
  }
  if (raw.length > 60) {
    return { error: 'Der Gesprächsverlauf ist zu lang. Bitte starten Sie den Chat neu.' }
  }

  const messages = []
  for (const item of raw) {
    const role = item?.role === 'assistant' ? 'assistant' : item?.role === 'user' ? 'user' : null
    const content = typeof item?.content === 'string' ? item.content.trim() : ''
    if (!role || !content) continue
    if (content.length > 2000) {
      return { error: 'Ihre Nachricht ist zu lang (max. 2000 Zeichen).' }
    }
    messages.push({ role, content })
  }

  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return { error: 'Es wurde keine gültige Nutzernachricht übermittelt.' }
  }
  return { value: { messages } }
}

/* ------------------------------------------------------------------ *
 * Routen
 * ------------------------------------------------------------------ */

async function handleAnalyze(req, res) {
  const body = await readJsonBody(req)
  const { error, value } = validateAnalyseInput(body)
  if (error) return sendJson(res, 400, { error })

  if (aiConfigured) {
    try {
      const text = await callAnthropic({
        system: ANALYSE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildAnalyseUserPrompt(value) }],
      })
      const analysis = normalizeAnalysis(text, value)
      if (analysis) {
        return sendJson(res, 200, { source: 'ki', model: MODEL, analysis })
      }
      console.warn('[symmedis] /api/analyze: Antwort nicht verwertbar → Demo-Modell')
    } catch (err) {
      logUpstreamFailure('/api/analyze', err)
    }
  }

  return sendJson(res, 200, {
    source: 'demo',
    analysis: buildFallbackAnalysis(value),
    notice: aiConfigured
      ? 'Die KI-Analyse war nicht erreichbar. Angezeigt wird das lokale Demo-Modell.'
      : 'Kein API-Zugang konfiguriert. Angezeigt wird das lokale Demo-Modell.',
  })
}

async function handleChat(req, res) {
  const body = await readJsonBody(req)
  const { error, value } = validateChatInput(body)
  if (error) return sendJson(res, 400, { error })

  if (aiConfigured) {
    try {
      // Vollständige Conversation-History bei jedem Request.
      const reply = await callAnthropic({
        system: CHAT_SYSTEM_PROMPT,
        messages: value.messages,
      })
      return sendJson(res, 200, { source: 'ki', model: MODEL, reply })
    } catch (err) {
      logUpstreamFailure('/api/chat', err)
    }
  }

  return sendJson(res, 200, {
    source: 'demo',
    reply: buildFallbackChatReply(value.messages),
    notice: aiConfigured
      ? 'Die KI-Antwort war nicht erreichbar. Angezeigt wird das lokale Demo-Modell.'
      : 'Kein API-Zugang konfiguriert. Angezeigt wird das lokale Demo-Modell.',
  })
}

/**
 * Zentrale Verteilung. Gibt `true` zurück, wenn die Anfrage behandelt wurde.
 */
export async function handleApiRequest(req, res) {
  const path = (req.url || '').split('?')[0]

  try {
    if (path === '/api/status' && req.method === 'GET') {
      sendJson(res, 200, { ai: aiConfigured, model: aiConfigured ? MODEL : null })
      return true
    }

    if (path === '/api/analyze') {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' }), true
      await handleAnalyze(req, res)
      return true
    }

    if (path === '/api/chat') {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' }), true
      await handleChat(req, res)
      return true
    }

    if (path.startsWith('/api/')) {
      sendJson(res, 404, { error: 'not_found' })
      return true
    }

    return false
  } catch (err) {
    const status = err?.status ?? 500
    const message =
      status === 413
        ? 'Die Anfrage ist zu groß.'
        : status === 400
          ? 'Die Anfrage konnte nicht gelesen werden.'
          : 'Unerwarteter Serverfehler.'
    if (!res.headersSent) sendJson(res, status, { error: message })
    return true
  }
}
