/**
 * Legacy/demo API client.
 *
 * Der lokale Browser-Fallback ist bewusst opt-in. Produktive Portale dürfen bei
 * einem nicht erreichbaren Backend niemals still auf Beispielinhalte wechseln.
 * Die echten SYMMEDIS-Analysepfade verwenden authentifizierte Supabase Edge
 * Functions; diese API bleibt ausschließlich für explizite Demo-Flows erhalten.
 */

import { buildFallbackAnalysis, buildFallbackChatReply } from './analysis.js'

const REQUEST_TIMEOUT_MS = 50_000

class ApiError extends Error {
  constructor(message, { status } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function postJson(path, payload, signal) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    let data = null
    try { data = await response.json() } catch { data = null }
    if (!response.ok) throw new ApiError(data?.error || 'Die Anfrage konnte nicht verarbeitet werden.', { status: response.status })
    return data
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

const OFFLINE_HINWEIS = 'Kein Demo-Backend erreichbar – angezeigt wird das lokale Demo-Modell im Browser.'

function darfDemoFallback(options) {
  return options?.allowDemoFallback === true
}

function produktFehler(error) {
  if (error instanceof ApiError) return error
  if (error?.name === 'AbortError') return error
  return new ApiError('Der Dienst ist derzeit nicht erreichbar. Es wurden keine Demo-Ergebnisse als echte Daten eingesetzt.')
}

/** Führt ausschließlich mit explizitem Opt-in einen lokalen Demo-Fallback aus. */
export async function requestAnalysis(input, signal, options = {}) {
  try {
    const data = await postJson('/api/analyze', input, signal)
    if (!data?.analysis) throw new ApiError('Unvollständige Antwort erhalten.')
    return data
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) throw error
    if (error?.name === 'AbortError' && signal?.aborted) throw error
    if (!darfDemoFallback(options)) throw produktFehler(error)
    return { source: 'demo', analysis: buildFallbackAnalysis(input), notice: OFFLINE_HINWEIS }
  }
}

/** Liefert einen lokalen Demo-Chat nur, wenn der aufrufende Demo-Flow dies explizit erlaubt. */
export async function requestChatReply(messages, signal, options = {}) {
  try {
    const data = await postJson('/api/chat', { messages }, signal)
    if (!data?.reply) throw new ApiError('Unvollständige Antwort erhalten.')
    return data
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) throw error
    if (error?.name === 'AbortError' && signal?.aborted) throw error
    if (!darfDemoFallback(options)) throw produktFehler(error)
    return { source: 'demo', reply: buildFallbackChatReply(messages), notice: OFFLINE_HINWEIS }
  }
}

export { ApiError }
