import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Card } from '../../components/ui/layout.jsx'
import { Abschnitt, CtaBand } from './parts.jsx'
import { GrowthSystemVisual } from './GrowthSystemVisual.jsx'
import { MITARBEITERPORTAL, KUNDENPORTAL, PLAN, PLATTFORM } from '../../content/marketing.js'
import {
  IconArrowRight,
  IconChart,
  IconCheck,
  IconDocument,
  IconFolder,
  IconLock,
  IconRoute,
  IconShield,
  IconTarget,
  IconUsers,
} from '../../components/ui/Icons.jsx'

const PORTALE = [
  { daten: KUNDENPORTAL, icon: IconUsers, ton: 'brand', ziel: '/login?rolle=kunde', cta: 'Zum Kundenportal' },
  { daten: MITARBEITERPORTAL, icon: IconLock, ton: 'accent', ziel: '/login?rolle=intern', cta: 'Zum Mitarbeiterportal' },
]

const LAYERS = [
  { icon: IconChart, title: 'Diagnosis', value: '10 Dimensionen', text: 'Beobachtung, Ursache, Auswirkung, Empfehlung, Evidence, Priority und Confidence in einer konsistenten Struktur.' },
  { icon: IconFolder, title: 'Evidence', value: 'Projektwissen', text: 'Unterlagen, indexierte Inhalte und Quellen bleiben mit Findings verbunden und projektweit durchsuchbar.' },
  { icon: IconTarget, title: 'Impact', value: 'Verifiziert statt erfunden', text: 'Umsatz- und Kostenhebel werden als Range modelliert und erst nach manueller Prüfung in den ROI übernommen.' },
  { icon: IconShield, title: 'Approval', value: 'Human reviewed', text: 'Vorschlag, interne Prüfung und Kundensichtbarkeit sind technisch voneinander getrennte Zustände.' },
  { icon: IconRoute, title: 'Execution', value: '30 / 60 / 90 Tage', text: 'Priorisierte Findings werden in sequenzierte Aufgaben mit Zuständigkeit, Fälligkeit und KPI übersetzt.' },
  { icon: IconDocument, title: 'Reporting', value: 'Versionierte Reports', text: 'Management-Reports enthalten nur freigegebene Daten; finale Versionen werden unveränderlich archiviert.' },
]

export function PlattformPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#07101d] text-white">
        <div aria-hidden="true" className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 14% 10%, rgba(94,129,255,.25), transparent 30%), radial-gradient(circle at 85% 55%, rgba(83,224,189,.13), transparent 28%)' }} />
        <div className="shell-container relative py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/80">{PLATTFORM.label}</p>
              <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-[3.35rem]">Die Diagnose endet nicht im PDF.</h1>
              <p className="mt-5 max-w-xl text-[1rem] leading-7 text-white/65">Diagnosis OS hält Analyse, Evidenz, Freigabe, Impact, Umsetzung und Kundenzusammenarbeit in einem einzigen nachvollziehbaren Arbeitsraum.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button as={Link} to="/demo" size="lg" className="border-white bg-white text-[#07101d] hover:bg-white/90">Produktdemo öffnen <IconArrowRight className="size-4" /></Button>
                <Button as={Link} to="/termin" size="lg" className="border border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.09]">Diagnosis OS besprechen</Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[0.7rem] font-semibold text-white/65">Tenant isolated</span>
                <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[0.7rem] font-semibold text-white/65">Human reviewed</span>
                <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[0.7rem] font-semibold text-white/65">Audit ready</span>
              </div>
            </div>
            <GrowthSystemVisual />
          </div>
        </div>
      </section>

      <Abschnitt eyebrow="Das Betriebssystem" headline="Sechs Ebenen, eine Entscheidungslogik" text="Jede Ebene löst ein anderes Problem – zusammen verhindern sie, dass Findings, Freigaben und Umsetzung in getrennten Tools auseinanderfallen." hell>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
          {LAYERS.map(({ icon: Icon, title, value, text }, index) => (
            <article key={title} className={`bg-surface p-6 ${index === 0 ? 'xl:bg-brand-softer' : ''}`}>
              <div className="flex items-center justify-between"><span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink"><Icon className="size-5" /></span><span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-3">{title}</span></div>
              <h2 className="mt-5 text-lg font-semibold tracking-tight text-ink">{value}</h2>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-2">{text}</p>
            </article>
          ))}
        </div>
      </Abschnitt>

      <section className="border-b border-line bg-surface">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.76fr_1.24fr] lg:gap-16">
            <div>
              <p className="eyebrow">Eine Quelle der Wahrheit</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.45rem]">Kunde und Team arbeiten am selben Projekt – aber nicht mit denselben Rechten.</h2>
              <p className="mt-4 text-[0.95rem] leading-7 text-ink-2">Die Trennung passiert nicht nur in der Oberfläche. Row Level Security und explizite Freigaben entscheiden auf Datenbankebene, was ein Kundenaccount sehen und verändern darf.</p>
            </div>

            <div className="grid gap-4">
              {PORTALE.map(({ daten, icon: Icon, ton, ziel, cta }) => (
                <Card key={daten.label} className="overflow-hidden">
                  <div className="grid md:grid-cols-[0.7fr_1.3fr]">
                    <div className={cn('p-6', ton === 'brand' ? 'bg-brand-softer' : 'bg-accent-soft')}>
                      <span className={cn('inline-flex size-11 items-center justify-center rounded-xl bg-surface', ton === 'brand' ? 'text-brand-ink' : 'text-accent-ink')}><Icon className="size-5" /></span>
                      <p className="eyebrow mt-5">{daten.label}</p>
                      <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink">{daten.headline}</h3>
                      <Button as={Link} to={ziel} variant="secondary" size="sm" className="mt-5">{cta} <IconArrowRight className="size-4" /></Button>
                    </div>
                    <div className="p-6">
                      <p className="text-[0.8125rem] leading-relaxed text-ink-2">{daten.text}</p>
                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {daten.punkte.slice(0, 6).map((punkt) => <li key={punkt} className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-ink-2"><IconCheck className="mt-0.5 size-3.5 shrink-0 text-ok-ink" />{punkt}</li>)}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-[#0b1220] text-white">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/75">Security by architecture</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[2.45rem]">„Nicht sichtbar“ ist bei uns eine Backend-Regel, kein CSS-Trick.</h2>
              <p className="mt-4 text-[0.9rem] leading-7 text-white/58">Interne Notizen, Report-Entwürfe, nicht freigegebene Findings und interne Dokumente bleiben für Kunden auch bei direktem API-Zugriff unerreichbar.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['RLS', 'Mandantentrennung direkt in PostgreSQL'],
                ['Documents', 'Explizite Kundensichtbarkeit bis in Storage'],
                ['Tasks', 'Kunden dürfen ausschließlich ihren Aufgabenstatus ändern'],
                ['Reports', 'Nur finale Reports + unveränderliche Versionen'],
              ].map(([title, text]) => <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-200/70">{title}</p><p className="mt-2 text-[0.8rem] leading-relaxed text-white/65">{text}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <Abschnitt eyebrow={PLAN.label} headline="Aus Diagnose wird eine Reihenfolge" text={PLAN.text} hell>
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-3">
          {PLAN.phasen.map((phase, index) => (
            <li key={phase.label} className="bg-surface p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3"><Chip toneName="brand" icon={IconRoute}>{phase.label}</Chip><span className="text-xs font-semibold tabular text-ink-3">0{index + 1}</span></div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{phase.ziel}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{phase.text}</p>
            </li>
          ))}
        </ol>
      </Abschnitt>

      <CtaBand titel="Sehen Sie sich das System an – oder bringen Sie direkt Ihre Wachstumsfrage mit." text="Die Produktdemo zeigt den Workflow mit gekennzeichneten Beispieldaten. Für ein echtes Projekt beginnen wir mit einem kurzen Diagnosegespräch." primaer={{ to: '/demo', label: 'Diagnosis OS ansehen' }} sekundaer={{ to: '/termin', label: 'Gespräch anfragen' }} />
    </>
  )
}
