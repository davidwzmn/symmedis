import { Link } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Card } from '../../components/ui/layout.jsx'
import { HeroDashboard } from './HeroDashboard.jsx'
import { Vertrauensleiste, CtaBand, MarketingBild } from './parts.jsx'
import { ZielgruppeSection, TeamSection } from './HomeSections.jsx'
import { HERO, VISUALS } from '../../content/marketing.js'
import {
  IconAlert,
  IconArrowRight,
  IconCalendar,
  IconChart,
  IconCheck,
  IconInfo,
  IconLayers,
  IconRoute,
  IconShield,
  IconSparkles,
  IconTarget,
} from '../../components/ui/Icons.jsx'

const WEGWEISER = [
  { to: '/problem', icon: IconAlert, titel: 'Das Problem', text: 'Warum gute Gesundheitsprodukte am Markt scheitern – und woran man Ursache von Symptom unterscheidet.' },
  { to: '/analysebereiche', icon: IconLayers, titel: 'Analysebereiche', text: 'Zehn Dimensionen werden zu einem belastbaren Gesamtbild für Positionierung, Vertrieb und Marktaktivierung.' },
  { to: '/funktionsweise', icon: IconRoute, titel: 'Funktionsweise', text: 'Von Unterlagen und Evidenz über die Diagnose bis zum priorisierten 90-Tage-Plan.' },
  { to: '/plattform', icon: IconChart, titel: 'Diagnosis OS', text: 'Analyse, Freigabe, Aufgaben, ROI, Dokumente und Zusammenarbeit in einer Plattform.' },
  { to: '/angebot', icon: IconSparkles, titel: 'Das Angebot', text: 'Strategische Ursachenanalyse mit klarer Entscheidungsvorlage statt weiterer Maßnahmen auf Verdacht.' },
  { to: '/faq', icon: IconInfo, titel: 'Häufige Fragen', text: 'Dauer, Datensicherheit, Vorgehen und Zusammenarbeit kompakt beantwortet.' },
]

const PRODUKTWERTE = [
  { wert: '10', label: 'Diagnosedimensionen', text: 'Ein konsistenter Blick auf Positionierung, Markt, Vertrieb und Kommunikation.' },
  { wert: '3', label: 'priorisierte Wachstumsbremsen', text: 'Nicht alles gleichzeitig – zuerst die Ursachen mit dem größten Hebel.' },
  { wert: '90', label: 'Tage Umsetzungsfokus', text: 'Aus Diagnose wird ein sequenzierter Plan mit Verantwortung und Messgrößen.' },
]

const SYSTEMPRINZIPIEN = [
  'Evidenz statt Bauchgefühl',
  'Human-in-the-loop statt Autopilot',
  'Mandantensichere Kunden- und Mitarbeiterportale',
  'Verifizierter Impact statt erfundener ROI',
]

export function HomePage() {
  const { getKunde } = useWorkspace()
  const kunde = getKunde('nordvita')

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-canvas">
        <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-45" />
        <div aria-hidden="true" className="absolute -left-24 top-16 size-80 rounded-full bg-brand-soft/70 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-20 bottom-0 size-96 rounded-full bg-accent-soft/60 blur-3xl" />

        <div className="shell-container relative py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip toneName="brand" icon={IconSparkles}>SYMMEDIS Diagnosis OS</Chip>
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink-3">Strategic Growth Intelligence</span>
              </div>

              <p className="eyebrow mt-7">{HERO.eyebrow}</p>
              <h1 className="mt-3 max-w-3xl text-[2.15rem] font-semibold leading-[1.04] tracking-[-0.035em] text-ink sm:text-[3rem] lg:text-[3.7rem]">
                Wachstum verstehen, bevor Sie mehr dafür ausgeben.
              </h1>
              <p className="mt-6 max-w-2xl text-[1.02rem] leading-7 text-ink-2 sm:text-[1.08rem]">
                {HERO.text}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button as={Link} to="/termin" variant="cta" size="lg">
                  <IconCalendar className="size-4" />
                  {HERO.ctaPrimary}
                </Button>
                <Button as={Link} to="/demo" variant="secondary" size="lg">
                  Produkt live ansehen
                  <IconArrowRight className="size-4" />
                </Button>
              </div>

              <ul className="mt-8 grid max-w-xl gap-2.5 sm:grid-cols-2">
                {SYSTEMPRINZIPIEN.map((punkt) => (
                  <li key={punkt} className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink-2">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
                      <IconCheck className="size-3.5" />
                    </span>
                    {punkt}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] border border-brand-border/50 bg-brand-softer/40 blur-xl" />
              <div className="relative rounded-[1.6rem] border border-line bg-surface/95 p-2 shadow-xl shadow-black/5 backdrop-blur">
                <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="size-2.5 rounded-full bg-line-strong" />
                    <span className="size-2.5 rounded-full bg-line-strong" />
                    <span className="size-2.5 rounded-full bg-line-strong" />
                  </div>
                  <span className="text-[0.68rem] font-medium uppercase tracking-[0.13em] text-ink-3">Live Diagnosis Workspace</span>
                  <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-accent-ink"><span className="size-1.5 rounded-full bg-accent" /> Human reviewed</span>
                </div>
                {kunde ? <HeroDashboard kunde={kunde} /> : null}
              </div>
            </div>
          </div>

          <div className="mt-14 grid overflow-hidden rounded-2xl border border-line bg-surface/90 sm:grid-cols-3">
            {PRODUKTWERTE.map((item, index) => (
              <div key={item.label} className={`p-5 sm:p-6 ${index ? 'border-t border-line sm:border-l sm:border-t-0' : ''}`}>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight text-ink">{item.wert}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.11em] text-brand-ink">{item.label}</span>
                </div>
                <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Vertrauensleiste />

      <section className="border-b border-line bg-surface">
        <div className="shell-container py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="eyebrow">Diagnosis OS</p>
              <h2 className="mt-3 text-[1.8rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2.15rem]">
                Von der diffusen Wachstumsfrage zur belastbaren Entscheidung.
              </h2>
              <p className="mt-4 text-[0.95rem] leading-7 text-ink-2">
                SYMMEDIS verbindet strukturierte Analyse, belastbare Evidenz, menschliche Freigabe und Umsetzung in einem durchgängigen System. Das Ergebnis ist keine weitere Präsentation, sondern ein Arbeitsmodell für die nächsten Entscheidungen.
              </p>
              <Button as={Link} to="/plattform" variant="secondary" size="sm" className="mt-6">
                Plattform entdecken <IconArrowRight className="size-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {WEGWEISER.map((eintrag, index) => (
                <Card as={Link} key={eintrag.to} to={eintrag.to} className={`group flex min-h-52 flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-brand-border hover:shadow-md ${index === 3 ? 'border-brand-border bg-brand-softer' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink"><eintrag.icon className="size-5" /></span>
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-ink-3">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold tracking-tight text-ink">{eintrag.titel}</h3>
                  <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-ink-2">{eintrag.text}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-brand-ink">Mehr erfahren <IconArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-canvas">
        <div className="shell-container py-16 lg:py-20">
          <div className="overflow-hidden rounded-[1.75rem] border border-brand-border bg-brand-softer">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="p-7 sm:p-10 lg:p-12">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand text-on-brand"><IconTarget className="size-6" /></span>
                <p className="eyebrow mt-7">Der Unterschied</p>
                <h2 className="mt-3 text-[1.7rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2rem]">Wir optimieren nicht zuerst die Maßnahme. Wir diagnostizieren zuerst das System.</h2>
                <p className="mt-4 text-[0.9375rem] leading-7 text-ink-2">Wenn Positionierung, Nutzenargumentation und Vertriebslogik nicht zusammenpassen, wird mehr Reichweite schnell nur teurer. SYMMEDIS macht Ursache, Beleg, Auswirkung und nächste Aktion sichtbar – und trennt Hypothese von freigegebenem Ergebnis.</p>
                <Button as={Link} to="/problem" variant="secondary" size="sm" className="mt-6">Warum klassische Maßnahmen zu kurz greifen <IconArrowRight className="size-4" /></Button>
              </div>
              <div className="border-t border-brand-border bg-surface/70 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['Diagnose', 'Zehn Dimensionen, Confidence, Quellen und klare Priorität.'],
                    ['Freigabe', 'KI darf vorschlagen. Menschen prüfen, ändern und veröffentlichen.'],
                    ['Impact', 'Umsatz- und Kostenpotenziale zählen erst nach manueller Verifizierung.'],
                    ['Umsetzung', 'Priorisierte Findings werden direkt in einen 30/60/90-Tage-Plan übersetzt.'],
                  ].map(([titel, text]) => (
                    <div key={titel} className="rounded-xl border border-line bg-surface p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink"><IconShield className="size-4 text-brand-ink" />{titel}</div>
                      <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-2">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {VISUALS.netzwerk.bild ? (
        <section className="bg-surface-inverse">
          <div className="shell-container py-14 lg:py-18"><MarketingBild visual={VISUALS.netzwerk} ratio="21 / 9" dunkel /></div>
        </section>
      ) : null}

      <ZielgruppeSection />
      <TeamSection />
      <CtaBand />
    </>
  )
}
