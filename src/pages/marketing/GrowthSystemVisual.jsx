import { IconCheck, IconRoute, IconShield, IconTarget } from '../../components/ui/Icons.jsx'

const STEPS = [
  { label: 'Beobachtung', value: 'Website & Vertrieb erzählen unterschiedliche Nutzenversprechen.' },
  { label: 'Ursache', value: 'Die zentrale Nutzenargumentation ist nicht verbindlich definiert.' },
  { label: 'Auswirkung', value: 'Mehr Erklärung, längere Sales-Zyklen und höhere Preissensibilität.' },
]

export function GrowthSystemVisual() {
  return (
    <div className="min-w-0 overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-lg sm:rounded-[1.75rem]">
      <div className="flex items-center justify-between gap-4 border-b border-line bg-surface-muted px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-brand-ink">BEISPIEL · DIAGNOSE</p>
          <p className="mt-1 text-sm font-semibold text-ink">Von der Beobachtung zur priorisierten Ursache</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ok-border bg-ok-soft px-2.5 py-1 text-xs font-medium text-ok-ink">
          <IconShield className="size-3.5" /> geprüft
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="rounded-2xl border border-brand-border bg-brand-softer p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
              <IconTarget className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-brand-ink">PRIORITÄT 1</p>
              <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-ink sm:text-xl">
                Die Nutzenargumentation bricht zwischen Website und Vertrieb.
              </h2>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-2">
                Die Ursache ist nicht fehlende Reichweite, sondern eine inkonsistente Übersetzung des Produktwerts entlang der Customer Journey.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {STEPS.map((step) => (
            <div key={step.label} className="grid gap-1 rounded-xl border border-line bg-canvas p-4 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
              <p className="text-xs font-semibold text-ink-3">{step.label}</p>
              <p className="text-[0.8125rem] leading-relaxed text-ink-2">{step.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-xs font-semibold text-ink-3">Evidenzlage</p>
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <IconCheck className="size-4 shrink-0 text-ok-ink" />
              Mehrere Quellen bestätigt
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">Website, Vertriebsunterlagen und Gesprächsnotizen weisen auf dasselbe Muster hin.</p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-xs font-semibold text-ink-3">Nächster Schritt</p>
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <IconRoute className="size-4 shrink-0 text-brand-ink" />
              Nutzenversprechen vereinheitlichen
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">Verantwortung, Fälligkeit und Messgröße werden direkt in den 90-Tage-Plan überführt.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
