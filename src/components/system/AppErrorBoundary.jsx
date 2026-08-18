import { Component } from 'react'

function incidentId() {
  const stamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `SYM-${stamp}-${random}`
}

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, incident: null }
  }

  static getDerivedStateFromError(error) {
    return { error, incident: incidentId() }
  }

  componentDidCatch(error, info) {
    // Keine Fehlermeldung oder Kundendaten in die sichtbare UI spiegeln.
    // Browser-Konsole bleibt für technische Diagnose im kontrollierten E2E nutzbar.
    console.error('SYMMEDIS render failure', {
      incident: this.state.incident,
      message: error instanceof Error ? error.message : 'unknown',
      componentStack: info?.componentStack || '',
    })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-danger-border bg-surface p-6 text-center shadow-lg sm:p-8" role="alert">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-danger-ink">Sicherer Wiederherstellungsmodus</p>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink">Diese Ansicht konnte nicht vollständig geladen werden.</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">Ihre gespeicherten Projektdaten bleiben unverändert. Laden Sie die Anwendung neu. Falls der Fehler erneut auftritt, kann die Vorgangsnummer zur technischen Zuordnung verwendet werden.</p>
          <p className="mt-4 font-mono text-xs text-ink-3">Vorgang {this.state.incident}</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Neu laden</button>
            <a href="./" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Zur Startseite</a>
          </div>
        </div>
      </main>
    )
  }
}
