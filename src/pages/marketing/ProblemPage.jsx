import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/primitives.jsx'
import { Abschnitt, CtaBand } from './parts.jsx'
import { PROBLEM, UEBER_UNS } from '../../content/marketing.js'
import { IconAlert, IconArrowRight, IconCheck, IconTarget } from '../../components/ui/Icons.jsx'

export function ProblemPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div aria-hidden="true" className="absolute -right-32 -top-32 size-[32rem] rounded-full bg-brand-soft/55 blur-3xl" />
        <div className="shell-container relative py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
            <div>
              <p className="eyebrow">{PROBLEM.label}</p>
              <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[3.3rem]">Gute Produkte können am falschen System scheitern.</h1>
            </div>
            <div className="lg:pb-1">
              <p className="max-w-2xl text-[1rem] leading-7 text-ink-2">{PROBLEM.text}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Positionierung', 'Verständlichkeit', 'Differenzierung', 'Marktaktivierung'].map((item) => <span key={item} className="rounded-full border border-line bg-canvas px-3 py-1.5 text-[0.7rem] font-semibold text-ink-2">{item}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-[#0b1220] text-white">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white text-[#0b1220]"><IconAlert className="size-5" /></span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200/70">Symptom ≠ Ursache</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[2.45rem]">Die offensichtliche Erklärung ist oft nur das sichtbare Ende der Kette.</h2>
              <p className="mt-4 text-[0.9rem] leading-7 text-white/58">Ein schwacher Kanal kann ein Kanalproblem sein. Oder das Ergebnis einer unklaren Positionierung, eines unbelegten Nutzens oder einer gebrochenen Übergabe zum Vertrieb.</p>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {PROBLEM.karten.map((karte, index) => (
                <article key={karte.titel} className="grid gap-4 py-6 sm:grid-cols-[3rem_0.85fr_1.15fr] sm:items-start sm:gap-5">
                  <span className="text-xs font-semibold tabular text-white/30">0{index + 1}</span>
                  <div><h3 className="text-base font-semibold text-white">{karte.titel}</h3><p className="mt-2 text-[0.75rem] leading-relaxed text-emerald-100/65">{karte.symptom}</p></div>
                  <p className="text-[0.8rem] leading-relaxed text-white/58">{karte.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Abschnitt eyebrow="Warum mehr Aktivität nicht reicht" headline="Marketing verstärkt, was strategisch bereits vorhanden ist." text="Wenn Kernaussage, Zielgruppe oder Nutzenlogik unscharf sind, skaliert zusätzliches Budget vor allem die Unklarheit. Deshalb beginnt SYMMEDIS nicht mit einer Maßnahmenliste." hell>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {UEBER_UNS.prinzipien.map((prinzip, index) => (
            <article key={prinzip.titel} className="bg-surface p-6 sm:p-7">
              <div className="flex items-center justify-between"><span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">{index === 0 ? <IconTarget className="size-5" /> : <IconCheck className="size-5" />}</span><span className="text-xs font-semibold tabular text-ink-3">0{index + 1}</span></div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{prinzip.titel}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{prinzip.text}</p>
            </article>
          ))}
        </div>
        <Button as={Link} to="/funktionsweise" variant="secondary" className="mt-7">So diagnostiziert SYMMEDIS Ursachen <IconArrowRight className="size-4" /></Button>
      </Abschnitt>

      <CtaBand titel="Bevor Sie die nächste Maßnahme finanzieren: Klären Sie, welches Problem sie lösen soll." text="Bringen Sie Ihre aktuelle Wachstumsfrage mit. Wir sagen im ersten Gespräch offen, ob eine Ursachenanalyse sinnvoll ist." primaer={{ to: '/termin', label: 'Diagnosegespräch anfragen' }} sekundaer={{ to: '/analysebereiche', label: '10 Analysebereiche ansehen' }} />
    </>
  )
}
