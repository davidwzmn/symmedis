import { cn } from '../../lib/cn.js'
import { KATEGORIE_MAP } from '../../data/catalog.js'
import { scoreStufe, tone } from '../../lib/tone.js'
import {
  IconChart,
  IconCheckSquare,
  IconFolder,
  IconGrid,
  IconRoute,
  IconShare,
  IconShield,
} from '../../components/ui/Icons.jsx'

/**
 * Produktvorschau im Hero.
 *
 * Bewusst keine abstrakte Illustration, sondern der reale Aufbau der
 * Anwendung mit echten Komponentenmustern und Beispieldaten. Für
 * Screenreader ist die Vorschau eine Abbildung mit Bildunterschrift – die
 * Zahlen darin sind Beispielwerte und tragen keine eigene Aussage.
 */
export function HeroDashboard({ kunde }) {
  const nav = [
    { label: 'Übersicht', icon: IconGrid, aktiv: true },
    { label: 'Analyse', icon: IconChart },
    { label: 'Social Media', icon: IconShare },
    { label: '90-Tage-Plan', icon: IconRoute },
    { label: 'Aufgaben', icon: IconCheckSquare },
    { label: 'Dokumente', icon: IconFolder },
  ]

  const dimensionen = ['positionierung', 'differenzierung', 'website', 'vertrieb', 'social']

  return (
    <figure className="m-0">
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg"
      >
        {/* Fensterleiste */}
        <div className="flex items-center gap-2 border-b border-line bg-surface-muted px-3.5 py-2.5">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
          </span>
          <span className="ml-2 truncate rounded-md bg-surface px-2.5 py-1 text-[0.625rem] text-ink-3">
            diagnosis-os.symmedis.de / kundenportal / übersicht
          </span>
        </div>

        <div className="flex">
          {/* Seitenleiste */}
          <div className="hidden w-40 shrink-0 border-r border-line p-2.5 sm:block">
            <div className="flex items-center gap-2 px-1.5 pb-3">
              <span className="inline-flex size-6 items-center justify-center rounded-md bg-brand text-[0.625rem] font-bold text-on-brand">
                S
              </span>
              <span className="text-[0.6875rem] font-semibold text-ink">SYMMEDIS</span>
            </div>
            <ul className="space-y-0.5">
              {nav.map((eintrag) => (
                <li key={eintrag.label}>
                  <span
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.6875rem] font-medium',
                      eintrag.aktiv ? 'bg-brand-soft text-brand-ink' : 'text-ink-3',
                    )}
                  >
                    <eintrag.icon className="size-3.5" />
                    {eintrag.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Inhalt */}
          <div className="min-w-0 flex-1 space-y-3 bg-canvas p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[0.8125rem] font-semibold text-ink">
                  {kunde.unternehmen}
                </p>
                <p className="truncate text-[0.625rem] text-ink-3">
                  Ursachenanalyse · Ergebnistermin 04.08.2026
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-accent-border bg-accent-soft px-1.5 py-0.5 text-[0.5625rem] font-medium text-accent-ink">
                <IconShield className="size-2.5" />
                Menschliche Prüfung
              </span>
            </div>

            {/* Kennzahlen */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Reifegrad', wert: kunde.gesamtScore, zusatz: '/100' },
                { label: 'Fortschritt', wert: kunde.fortschritt, zusatz: '%' },
                { label: 'Offene Aufgaben', wert: kunde.aufgaben.filter((a) => a.status !== 'erledigt').length, zusatz: '' },
              ].map((kachel) => (
                <div key={kachel.label} className="rounded-lg border border-line bg-surface p-2">
                  <p className="truncate text-[0.5625rem] text-ink-3">{kachel.label}</p>
                  <p className="tabular mt-0.5 text-base leading-none font-semibold text-ink">
                    {kachel.wert}
                    <span className="text-[0.5625rem] font-normal text-ink-3">{kachel.zusatz}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Analysedimensionen */}
            <div className="rounded-lg border border-line bg-surface p-2.5">
              <p className="mb-2 text-[0.625rem] font-semibold text-ink">Analysedimensionen</p>
              <ul className="space-y-1.5">
                {dimensionen.map((id) => {
                  const eintrag = kunde.analyse.find((a) => a.kategorieId === id)
                  const stufe = scoreStufe(eintrag.score)
                  return (
                    <li key={id}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[0.625rem] text-ink-2">
                          {KATEGORIE_MAP[id].label}
                        </span>
                        <span className="tabular shrink-0 text-[0.625rem] font-semibold text-ink">
                          {eintrag.score}
                        </span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-viz-track">
                        <div
                          className={cn('h-full rounded-full', tone(stufe.tone).bar)}
                          style={{ width: `${eintrag.score}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Umsatzbremsen */}
            <div className="grid grid-cols-3 gap-2">
              {kunde.bremsen.map((bremse) => (
                <div key={bremse.id} className="rounded-lg border border-line bg-surface p-2">
                  <span className="inline-flex size-4 items-center justify-center rounded bg-surface-inverse text-[0.5625rem] font-bold text-canvas">
                    {bremse.rang}
                  </span>
                  <p className="mt-1.5 truncate text-[0.625rem] font-semibold text-ink">
                    {bremse.titel}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[0.5625rem] leading-snug text-ink-3">
                    {bremse.ursache}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 text-center text-xs text-ink-3">
        Beispielansicht des Kundenportals mit fiktiven Projektdaten
      </figcaption>
    </figure>
  )
}
