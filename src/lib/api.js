/**
 * Client-seitiger API-Zugriff.
 *
 * Der Server antwortet auch ohne API-Key immer mit verwertbaren Inhalten.
 * Falls der Server selbst nicht erreichbar ist (z. B. statisches Hosting ohne
 * Node-Backend), greift zusätzlich das lokale Demo-Modell im Browser – die
 * Demo bleibt dadurch unter allen Umständen bedienbar.
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
    try {
      data = await response.json()
    } catch {
      data = null
    }

    if (!response.ok) {
      throw new ApiError(data?.error || 'Die Anfrage konnte nicht verarbeitet werden.', {
        status: response.status,
      })
    }
    return data
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

const OFFLINE_HINWEIS =
  'Kein Backend erreichbar – angezeigt wird das lokale Demo-Modell im Browser.'

/** Führt die Ursachenanalyse durch. */
export async function requestAnalysis(input, signal) {
  try {
    const data = await postJson('/api/analyze', input, signal)
    if (!data?.analysis) throw new ApiError('Unvollständige Antwort erhalten.')
    return data
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) throw error
    if (error?.name === 'AbortError' && signal?.aborted) throw error
    return {
      source: 'demo',
      analysis: buildFallbackAnalysis(input),
      notice: OFFLINE_HINWEIS,
    }
  }
}

/** Sendet die vollständige Conversation-History und liefert die Antwort. */
export async function requestChatReply(messages, signal) {
  try {
    const data = await postJson('/api/chat', { messages }, signal)
    if (!data?.reply) throw new ApiError('Unvollständige Antwort erhalten.')
    return data
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) throw error
    if (error?.name === 'AbortError' && signal?.aborted) throw error
    return {
      source: 'demo',
      reply: buildFallbackChatReply(messages),
      notice: OFFLINE_HINWEIS,
    }
  }
}

export { ApiError }
