/**
 * Legacy-/Demo-API für lokale Entwicklung und optionale Node-Auslieferung.
 * Echte Portal-Analyse läuft separat über die authentifizierte Supabase Edge Function.
 *
 * Ein vorhandener Anthropic-Key allein aktiviert hier niemals kostenpflichtige
 * Modellaufrufe. Dafür muss zusätzlich SYMMEDIS_AI_ENABLED=true gesetzt sein.
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
const AI_ENABLED = process.env.SYMMEDIS_AI_ENABLED === 'true'
const UPSTREAM_TIMEOUT_MS = 45_000
const MAX_BODY_BYTES = 64 * 1024

const BRANCHEN_IDS = new Set(BRANCHEN.map((b) => b.id))

export const aiConfigured = Boolean(AI_ENABLED && (API_KEY || AUTH_TOKEN))

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

function authHeaders() {
  if (API_KEY) return { 'x-api-key': API_KEY }
  return {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'anthropic-beta': 'oauth-2025-04-20',
  }
}

async function callAnthropic({ system, messages }) {
  if (!aiConfigured) throw new Error('ai_disabled')
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
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system, messages }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw Object.assign(new Error(`upstream_${response.status}`), {
        status: response.status,
        detail: detail.slice(0, 500),
      })
    }

    const data = await response.json()
    if (data.stop_reason === 'refusal') throw Object.assign(new Error('upstream_refusal'), { status: 422 })

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
  console.warn(`[symmedis] ${route}: optionaler KI-Aufruf fehlgeschlagen (${reason}) → lokaler Demo-Fallback`)
}

function validateAnalyseInput(body) {
  const branche = typeof body?.branche === 'string' ? body.branche : ''
  const situation = typeof body?.situation === 'string' ? body.situation.trim() : ''
  if (!BRANCHEN_IDS.has(branche)) return { error: 'Bitte wählen Sie eine Branche aus.' }
  if (situation.length < 10) return { error: 'Bitte beschreiben Sie Ihre Situation in mindestens 10 Zeichen.' }
  if (situation.length > 1500) return { error: 'Bitte fassen Sie sich etwas kürzer (max. 1500 Zeichen).' }
  return { value: { branche, situation } }
}

function validateChatInput(body) {
  const raw = Array.isArray(body?.messages) ? body.messages : null
  if (!raw || raw.length === 0) return { error: 'Es wurde keine Nachricht übermittelt.' }
  if (raw.length > 60) return { error: 'Der Gesprächsverlauf ist zu lang. Bitte starten Sie den Chat neu.' }

  const messages = []
  for (const item of raw) {
    const role = item?.role === 'assistant' ? 'assistant' : item?.role === 'user' ? 'user' : null
    const content = typeof item?.content === 'string' ? item.content.trim() : ''
    if (!role || !content) continue
    if (content.length > 2000) return { error: 'Ihre Nachricht ist zu lang (max. 2000 Zeichen).' }
    messages.push({ role, content })
  }
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') return { error: 'Es wurde keine gültige Nutzernachricht übermittelt.' }
  return { value: { messages } }
}

async function handleAnalyze(req, res) {
  const body = await readJsonBody(req)
  const { error, value } = validateAnalyseInput(body)
  if (error) return sendJson(res, 400, { error })

  if (aiConfigured) {
    try {
      const text = await callAnthropic({ system: ANALYSE_SYSTEM_PROMPT, messages: [{ role: 'user', content: buildAnalyseUserPrompt(value) }] })
      const analysis = normalizeAnalysis(text, value)
      if (analysis) return sendJson(res, 200, { source: 'ki', model: MODEL, analysis })
      console.warn('[symmedis] /api/analyze: optionale KI-Antwort nicht verwertbar → lokaler Demo-Fallback')
    } catch (err) {
      logUpstreamFailure('/api/analyze', err)
    }
  }

  return sendJson(res, 200, {
    source: 'demo',
    analysis: buildFallbackAnalysis(value),
    notice: AI_ENABLED
      ? 'Die optionale KI-Analyse ist nicht verfügbar. Angezeigt wird der lokale Demo-Assistent.'
      : 'Bezahlte KI ist deaktiviert. Angezeigt wird der lokale Demo-Assistent.',
  })
}

async function handleChat(req, res) {
  const body = await readJsonBody(req)
  const { error, value } = validateChatInput(body)
  if (error) return sendJson(res, 400, { error })

  if (aiConfigured) {
    try {
      const reply = await callAnthropic({ system: CHAT_SYSTEM_PROMPT, messages: value.messages })
      return sendJson(res, 200, { source: 'ki', model: MODEL, reply })
    } catch (err) {
      logUpstreamFailure('/api/chat', err)
    }
  }

  return sendJson(res, 200, {
    source: 'demo',
    reply: buildFallbackChatReply(value.messages),
    notice: AI_ENABLED
      ? 'Die optionale KI-Antwort ist nicht verfügbar. Angezeigt wird der lokale Demo-Assistent.'
      : 'Bezahlte KI ist deaktiviert. Angezeigt wird der lokale Demo-Assistent.',
  })
}

export async function handleApiRequest(req, res) {
  const path = (req.url || '').split('?')[0]

  try {
    if (path === '/api/status' && req.method === 'GET') {
      sendJson(res, 200, { ai: aiConfigured, enabled: AI_ENABLED, model: aiConfigured ? MODEL : null })
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
    const message = status === 413 ? 'Die Anfrage ist zu groß.' : status === 400 ? 'Die Anfrage konnte nicht gelesen werden.' : 'Unerwarteter Serverfehler.'
    if (!res.headersSent) sendJson(res, status, { error: message })
    return true
  }
}
