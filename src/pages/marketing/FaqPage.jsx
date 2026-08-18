import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn.js'
import { Button } from '../../components/ui/primitives.jsx'
import { CtaBand } from './parts.jsx'
import { FAQ } from '../../content/marketing.js'
import { IconArrowRight, IconChevronDown, IconShield } from '../../components/ui/Icons.jsx'

export function FaqPage() {
  const [offen, setOffen] = useState(0)

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:gap-20">
            <div><p className="eyebrow">Häufige Fragen</p><h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[3.35rem]">Die Fragen, die vor einer guten Entscheidung geklärt sein sollten.</h1></div>
            <p className="max-w-2xl text-[1rem] leading-7 text-ink-2">Dauer, Datensicherheit, KI, Umsetzung und Eignung – ohne versteckte Verkaufssprache und ohne so zu tun, als passe SYMMEDIS für jedes Unternehmen.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-canvas">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-brand-border bg-brand-softer p-6">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand text-on-brand"><IconShield className="size-5" /></span>
                <h2 className="mt-5 text-lg font-semibold tracking-tight text-ink">Eine Antwort fehlt?</h2>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">Schicken Sie uns die konkrete Wachstumsfrage. Wir klären im ersten Gespräch, ob eine Diagnose überhaupt der richtige nächste Schritt ist.</p>
                <Button as={Link} to="/termin" variant="secondary" size="sm" className="mt-5">Frage stellen <IconArrowRight className="size-4" /></Button>
              </div>
              <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">Was uns wichtig ist</p>
                <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-2">Keine Patienten- oder Gesundheitsdaten im Erstkontakt. Keine automatische Kundenfreigabe durch KI. Keine künstliche Verknappung im Verkauf.</p>
              </div>
            </aside>

            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              {FAQ.map((eintrag, index) => {
                const aktiv = offen === index
                return (
                  <div key={eintrag.frage} className={cn(index ? 'border-t border-line' : '', aktiv && 'bg-brand-softer/35')}>
                    <h2>
                      <button type="button" onClick={() => setOffen(aktiv ? -1 : index)} aria-expanded={aktiv} aria-controls={`faq-${index}`} className="grid w-full grid-cols-[2.5rem_1fr_auto] items-start gap-3 px-5 py-5 text-left transition-colors hover:bg-surface-muted sm:px-6 sm:py-6">
                        <span className="pt-0.5 text-[0.68rem] font-semibold tabular text-ink-3">0{index + 1}</span>
                        <span className="text-[0.95rem] font-semibold leading-snug text-ink">{eintrag.frage}</span>
                        <IconChevronDown className={cn('mt-0.5 size-4 shrink-0 text-ink-3 transition-transform duration-200', aktiv && 'rotate-180')} />
                      </button>
                    </h2>
                    {aktiv ? <div id={`faq-${index}`} className="grid grid-cols-[2.5rem_1fr] gap-3 px-5 pb-6 sm:px-6"><span /><p className="max-w-2xl text-[0.875rem] leading-7 text-ink-2">{eintrag.antwort}</p></div> : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <CtaBand titel="Die wichtigste Frage ist Ihre konkrete Situation." text="15 Minuten reichen, um zu prüfen, ob eine strategische Ursachenanalyse sinnvoll ist – oder ob Sie etwas anderes brauchen." primaer={{ to: '/termin', label: 'Diagnosegespräch anfragen' }} sekundaer={{ to: '/plattform', label: 'Diagnosis OS ansehen' }} />
    </>
  )
}
