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

  const sendVital = (metricName, metricValue) => {
    if (!Number.isFinite(metricValue)) return
    void sendOperationalTelemetry({
      eventType: 'web_vital',
      outcome: 'observed',
      metricName,
      metricValue,
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

  const flush = () => {
    if (lcp != null) sendVital('lcp', lcp)
    if (cls > 0) sendVital('cls', rounded(cls, 4))
    if (inp != null) sendVital('inp', rounded(inp))
  }

  window.addEventListener('pagehide', flush, { once: true })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}
