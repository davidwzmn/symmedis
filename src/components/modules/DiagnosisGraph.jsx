import { useMemo } from 'react'
import { cn } from '../../lib/cn.js'
import { KATEGORIE_MAP } from '../../data/catalog.js'
import { PRIORITAETEN, scoreStufe } from '../../lib/tone.js'
import { Chip } from '../ui/primitives.jsx'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Visueller Ursachenbaum für die stärksten diagnostischen Hebel.
 * Nutzt ausschließlich bestehende Analyse-Daten und bleibt damit auch
 * im statischen Demo-Modus vollständig funktionsfähig.
 */
export function DiagnosisGraph({ kunde, onSelect, className }) {
  const nodes = useMemo(() => {
    return [...kunde.analyse]
      .sort((a, b) => {
        const prio = { hoch: 0, mittel: 1, niedrig: 2 }
        return (prio[a.prioritaet] ?? 3) - (prio[b.prioritaet] ?? 3) || a.score - b.score
      })
      .slice(0, 4)
  }, [kunde.analyse])

  const impact = kunde.bremsen?.[0]?.titel ?? 'Wachstumspotenzial bleibt ungenutzt'

  return (
    <section
      aria-labelledby="diagnosis-graph-title"
      className={cn('overflow-hidden rounded-2xl border border-line bg-surface shadow-sm', className)}
    >
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-ink">
              Diagnosis Graph
            </p>
            <h2 id="diagnosis-graph-title" className="mt-1 text-lg font-semibold tracking-tight text-ink">
              Von der Geschäftswirkung zur Ursache
            </h2>
            <p className="mt-1 max-w-2xl text-[0.8125rem] leading-relaxed text-ink-2">
              Die wichtigsten diagnostischen Hebel werden nach Priorität und Reifegrad geordnet. Jeder Knoten führt direkt zum Beleg, zur Ursache und zur empfohlenen Maßnahme.
            </p>
          </div>
          <Chip toneName="neutral" size="sm">{nodes.length} priorisierte Hebel</Chip>
        </div>
      </div>

      <div className="relative px-5 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="relative z-10 mx-auto max-w-xl rounded-xl border border-brand-border bg-brand-soft px-5 py-4 text-center">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-ink">Geschäftswirkung</p>
            <p className="mt-1 text-base font-semibold text-ink">{impact}</p>
          </div>

          <div aria-hidden="true" className="mx-auto h-7 w-px bg-line-strong" />

          <div className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div aria-hidden="true" className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-0 hidden h-px bg-line-strong xl:block" />
            {nodes.map((eintrag, index) => {
              const kategorie = KATEGORIE_MAP[eintrag.kategorieId]
              const stufe = scoreStufe(eintrag.score)
              const prio = PRIORITAETEN[eintrag.prioritaet]
              const confidence = clamp(100 - Math.round(Math.abs(58 - eintrag.score) * 0.45), 72, 96)

              return (
                <div key={eintrag.kategorieId} className="relative pt-4 xl:pt-5">
                  <div aria-hidden="true" className="absolute left-1/2 top-0 hidden h-5 w-px -translate-x-1/2 bg-line-strong xl:block" />
                  <button
                    type="button"
                    onClick={() => onSelect?.(eintrag.kategorieId)}
                    className="group h-full w-full rounded-xl border border-line bg-canvas p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-border hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-inverse text-[0.6875rem] font-semibold text-canvas">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <Chip size="sm" toneName={prio?.tone ?? 'neutral'}>{prio?.label ?? eintrag.prioritaet}</Chip>
                    </div>

                    <p className="mt-3 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink-3">
                      {kategorie?.gruppe}
                    </p>
                    <h3 className="mt-1 text-[0.9375rem] font-semibold leading-snug text-ink group-hover:text-brand-ink">
                      {kategorie?.label}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[0.8125rem] leading-relaxed text-ink-2">
                      {eintrag.ursache || eintrag.beobachtung}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3">
                      <div>
                        <span className="block text-[0.625rem] uppercase tracking-[0.08em] text-ink-3">Reifegrad</span>
                        <span className="mt-0.5 block text-sm font-semibold tabular-nums text-ink">{eintrag.score}/100</span>
                      </div>
                      <div>
                        <span className="block text-[0.625rem] uppercase tracking-[0.08em] text-ink-3">Konfidenz</span>
                        <span className="mt-0.5 block text-sm font-semibold tabular-nums text-ink">{confidence}%</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Chip size="sm" toneName={stufe.tone}>{stufe.label}</Chip>
                      <span className="text-xs font-medium text-brand-ink">Details öffnen →</span>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
