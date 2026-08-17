import { Link } from 'react-router-dom'
import { FREIGABE } from '../../lib/tone.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Abschnitt, CtaBand } from './parts.jsx'
import { FUNKTIONSWEISE } from '../../content/marketing.js'
import { IconArrowRight, IconCheck, IconRoute, IconShield, IconTarget } from '../../components/ui/Icons.jsx'

const FREIGABE_REIHE = ['vorgeschlagen', 'pruefung', 'bearbeitet', 'intern', 'kunde']

export function FunktionsweisePage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:gap-20">
            <div>
              <p className="eyebrow">{FUNKTIONSWEISE.label}</p>
              <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[3.35rem]">Von der Vermutung zur Entscheidung – ohne Black Box.</h1>
            </div>
            <p className="max-w-2xl text-[1rem] leading-7 text-ink-2">{FUNKTIONSWEISE.text}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-[#0b1220] text-white">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white text-[#0b1220]"><IconRoute className="size-5" /></span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200/70">Vier Schritte</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[2.45rem]">Jeder Schritt hat einen klaren Zweck und einen klaren Verantwortlichen.</h2>
              <p className="mt-4 text-[0.9rem] leading-7 text-white/55">Software reduziert Such- und Strukturarbeit. Strategische Einordnung, Priorisierung und Veröffentlichung bleiben bewusst menschliche Entscheidungen.</p>
            </div>

            <ol className="border-l border-white/12 pl-6 sm:pl-8">
              {FUNKTIONSWEISE.schritte.map((schritt, index) => (
                <li key={schritt.nummer} className={`relative pb-9 ${index === FUNKTIONSWEISE.schritte.length - 1 ? 'pb-0' : ''}`}>
                  <span className="absolute -left-[2rem] top-0 inline-flex size-4 rounded-full border-4 border-[#0b1220] bg-emerald-300 sm:-left-[2.5rem]" />
                  <div className="grid gap-3 sm:grid-cols-[3.5rem_0.8fr_1.2fr] sm:gap-5">
                    <span className="text-xs font-semibold text-emerald-200/60">0{schritt.nummer}</span>
                    <div><h3 className="text-base font-semibold text-white">{schritt.titel}</h3><Chip size="sm" toneName={schritt.traeger.startsWith('Team') ? 'accent' : 'neutral'} className="mt-2">{schritt.traeger}</Chip></div>
                    <p className="text-[0.8rem] leading-relaxed text-white/52">{schritt.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <Abschnitt eyebrow="Human-in-the-loop" headline="Der Freigabeprozess ist Teil des Produkts – nicht ein Disclaimer." text="Ein Analysepunkt verändert seinen Status sichtbar und nachvollziehbar. So ist jederzeit klar, was ein Systemvorschlag, was intern geprüft und was tatsächlich kundenfreigegeben ist." hell>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="overflow-x-auto p-5 sm:p-6">
            <ol className="flex min-w-[48rem] items-center gap-3">
              {FREIGABE_REIHE.map((key, index) => (
                <li key={key} className="flex flex-1 items-center gap-3">
                  <div className={`min-w-36 flex-1 rounded-xl border p-4 ${index === FREIGABE_REIHE.length - 1 ? 'border-brand-border bg-brand-softer' : 'border-line bg-canvas'}`}>
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-3">Stufe {index + 1}</span>
                    <p className="mt-2 text-sm font-semibold text-ink">{FREIGABE[key].label}</p>
                    <div className="mt-2"><Chip size="sm" toneName={FREIGABE[key].tone}>{FREIGABE[key].kurz}</Chip></div>
                  </div>
                  {index < FREIGABE_REIHE.length - 1 ? <IconArrowRight className="size-4 shrink-0 text-ink-3" /> : null}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            ['Evidenz', 'Jeder Punkt behält Belege und Confidence statt nur eine Schlussfolgerung.'],
            ['Prüfung', 'Mitarbeitende können korrigieren, kommentieren und bewusst freigeben.'],
            ['Kundensicht', 'Nur explizit freigegebene Inhalte verlassen den internen Arbeitsbereich.'],
          ].map(([title, text], index) => <div key={title} className="rounded-xl border border-line bg-canvas p-5"><div className="flex items-center gap-2"><span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">{index === 1 ? <IconShield className="size-4" /> : index === 2 ? <IconCheck className="size-4" /> : <IconTarget className="size-4" />}</span><h3 className="text-sm font-semibold text-ink">{title}</h3></div><p className="mt-3 text-[0.78rem] leading-relaxed text-ink-2">{text}</p></div>)}
        </div>

        <Button as={Link} to="/plattform" variant="secondary" className="mt-7">So bildet Diagnosis OS das ab <IconArrowRight className="size-4" /></Button>
      </Abschnitt>

      <section className="border-b border-line bg-surface">
        <div className="shell-container py-14 lg:py-18">
          <div className="grid gap-6 rounded-2xl border border-brand-border bg-brand-softer p-6 sm:p-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div><p className="eyebrow">Das Ergebnis</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">Am Ende steht eine Entscheidungsvorlage – kein Foliensatz ohne Folgeprozess.</h2></div>
            <div className="grid gap-2 sm:grid-cols-3">{['3 priorisierte Ursachen', 'Management-Report', '30/60/90-Tage-Plan'].map((item) => <div key={item} className="flex items-start gap-2 rounded-xl bg-surface px-4 py-3 text-[0.78rem] font-medium text-ink-2"><IconCheck className="mt-0.5 size-4 shrink-0 text-ok-ink" />{item}</div>)}</div>
          </div>
        </div>
      </section>

      <CtaBand titel="Bringen Sie Ihre aktuelle Wachstumsfrage mit." text="Wir klären im ersten Gespräch, ob die Ursache wahrscheinlich in Strategie, Kommunikation, Marktaktivierung – oder ganz woanders liegt." primaer={{ to: '/termin', label: 'Diagnosegespräch anfragen' }} sekundaer={{ to: '/angebot', label: 'Leistung & Investition' }} />
    </>
  )
}
