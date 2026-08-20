import { sendOperationalTelemetry } from './supabase.js'

let installed = false

function rounded(value, digits = 0) {
  const factor = 10 ** digits
  return Math.round(Number(value) * factor) / factor
}

function observe(name, callback) {
  if (typeof PerformanceObserver === 'undefined') return null
  try {
    const observer = new PerformanceObserver((list) => callback(list.getEntries()))
    observer.observe({ type: name, buffered: true })
    return observer
  } catch {
    return null
  }
}

function authenticatedSurface() {
  const path = `${window.location.pathname}${window.location.hash}`
  if (/(?:\/|#\/)intern(?:\/|$)/.test(path)) return 'staff'
  if (/(?:\/|#\/)portal(?:\/|$)/.test(path)) return 'customer'
  return null
}

export function recordRenderFailure() {
  void sendOperationalTelemetry({ eventType: 'render_failure', outcome: 'failure' })
}

export function recordWorkspaceLoad(outcome, durationMs, error = null, accessToken = null) {
  void sendOperationalTelemetry({
    eventType: 'workspace_load',
    outcome,
    durationMs,
    httpStatus: Number.isInteger(error?.status) ? error.status : undefined,
    traceId: typeof error?.traceId === 'string' ? error.traceId : undefined,
  }, accessToken)
}

export function installOperationalTelemetry() {
  if (installed || typeof window === 'undefined') return
  installed = true

  const sentVitals = new Map()
  const sendVital = (metricName, metricValue) => {
    if (!Number.isFinite(metricValue)) return
    const normalized = metricName === 'cls' ? rounded(metricValue, 4) : rounded(metricValue)
    if (sentVitals.get(metricName) === normalized) return
    sentVitals.set(metricName, normalized)
    void sendOperationalTelemetry({
      eventType: 'web_vital',
      outcome: 'observed',
      metricName,
      metricValue: normalized,
    })
  }

  let lcp = null
  let cls = 0
  let inp = null

  observe('largest-contentful-paint', (entries) => {
    const last = entries.at(-1)
    if (last) lcp = rounded(last.startTime)
  })

  observe('layout-shift', (entries) => {
    for (const entry of entries) {
      if (!entry.hadRecentInput) cls += entry.value
    }
  })

  observe('event', (entries) => {
    for (const entry of entries) {
      if (entry.interactionId && Number.isFinite(entry.duration)) inp = Math.max(inp || 0, entry.duration)
    }
  })

  let workspaceStartedAt = null
  let workspaceRecorded = false
  const workspaceState = () => {
    const surface = authenticatedSurface()
    if (!surface || workspaceRecorded) return
    const busy = Boolean(document.querySelector('main[aria-busy="true"]'))
    const failure = document.body?.innerText?.includes('Workspace konnte nicht geladen werden') || false
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (busy && workspaceStartedAt == null) workspaceStartedAt = now
    if (failure) {
      workspaceRecorded = true
      recordWorkspaceLoad('failure', workspaceStartedAt == null ? 0 : now - workspaceStartedAt)
      return
    }
    if (!busy && workspaceStartedAt != null) {
      workspaceRecorded = true
      recordWorkspaceLoad('success', now - workspaceStartedAt)
    }
  }

  const workspaceObserver = new MutationObserver(workspaceState)
  workspaceObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-busy'] })
  queueMicrotask(workspaceState)

  const flush = () => {
    if (lcp != null) sendVital('lcp', lcp)
    if (cls > 0) sendVital('cls', cls)
    if (inp != null) sendVital('inp', inp)
  }

  window.addEventListener('pagehide', flush, { once: true })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}
