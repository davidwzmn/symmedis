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

/** Die sechs Unterseiten als Überblickskarten auf der Startseite. */
const WEGWEISER = [
  {
    to: '/problem',
    icon: IconAlert,
    titel: 'Das Problem',
    text: 'Warum gute Gesundheitsprodukte am Markt scheitern – und woran man Ursache von Symptom unterscheidet.',
  },
  {
    to: '/analysebereiche',
    icon: IconLayers,
    titel: 'Analysebereiche',
    text: 'Zehn Dimensionen in drei Gruppen, aus denen sich ein zusammenhängendes Bild ergibt.',
  },
  {
    to: '/funktionsweise',
    icon: IconRoute,
    titel: 'Funktionsweise',
    text: 'Vier Schritte von der Vermutung zur Klarheit. Software strukturiert, das Team entscheidet.',
  },
  {
    to: '/plattform',
    icon: IconChart,
    titel: 'Die Plattform',
    text: 'Analyse, Freigabe, Aufgaben und Zusammenarbeit in einer Anwendung – mit zwei getrennten Portalen.',
  },
  {
    to: '/angebot',
    icon: IconSparkles,
    titel: 'Das Angebot',
    text: 'Die Ursachenanalyse in 10–14 Tagen: Leistungsumfang, Eckdaten und wer dahintersteht.',
  },
  {
    to: '/faq',
    icon: IconInfo,
    titel: 'Häufige Fragen',
    text: 'Was Unternehmen vor der Analyse wissen wollen – von Dauer bis Datentrennung.',
  },
]

export function HomePage() {
  const { getKunde } = useWorkspace()
  const kunde = getKunde('nordvita')

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-60" />
        <div className="shell-container relative py-14 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div>
              <p className="eyebrow">{HERO.eyebrow}</p>

              <h1 className="mt-3 text-[1.875rem] leading-[1.15] font-semibold tracking-tight text-ink sm:text-[2.375rem] lg:text-[2.75rem]">
                {HERO.headline}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-2">{HERO.text}</p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button as={Link} to="/termin" variant="cta" size="lg">
                  <IconCalendar className="size-4" />
                  {HERO.ctaPrimary}
                </Button>
                <Button as={Link} to="/demo" variant="secondary" size="lg">
                  {HERO.ctaSecondary}
                  <IconArrowRight className="size-4" />
                </Button>
              </div>

              <span className="mt-6 inline-flex">
                <Chip toneName="brand" icon={IconShield}>
                  {HERO.badge}
                </Chip>
              </span>

              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                {['10–14 Tage bis zum Ergebnis', 'Menschlich geprüft', '90-Tage-Plan inklusive'].map(
                  (punkt) => (
                    <li key={punkt} className="flex items-center gap-1.5 text-[0.8125rem] text-ink-2">
                      <IconCheck className="size-4 shrink-0 text-accent-ink" />
                      {punkt}
                    </li>
                  ),
                )}
              </ul>
            </div>

            {kunde ? <HeroDashboard kunde={kunde} /> : null}
          </div>
        </div>
      </section>

      <Vertrauensleiste />

      {/* Wegweiser zu den Unterseiten */}
      <section className="border-b border-line bg-surface">
        <div className="shell-container py-14 lg:py-18">
          <div className="max-w-3xl">
            <p className="eyebrow">Überblick</p>
            <h2 className="mt-2.5 text-[1.5rem] font-semibold tracking-tight text-ink sm:text-[1.75rem]">
              Wo Sie starten möchten
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">
              Sechs Bereiche erklären, was SYMMEDIS tut, wie die Analyse funktioniert und was Sie
              erwartet. Jeder Bereich ist eine eigene Seite.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WEGWEISER.map((eintrag) => (
              <Card
                as={Link}
                key={eintrag.to}
                to={eintrag.to}
                className="group flex flex-col p-5 transition-colors hover:border-brand-border hover:bg-brand-softer"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                  <eintrag.icon className="size-5" />
                </span>
                <h3 className="mt-3.5 text-[0.9375rem] font-semibold text-ink">{eintrag.titel}</h3>
                <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-ink-2">
                  {eintrag.text}
                </p>
                <span className="mt-3.5 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-brand-ink">
                  Ansehen
                  <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Kurzer Prinzip-Block */}
      <section className="border-b border-line bg-canvas">
        <div className="shell-container py-14 lg:py-16">
          <Card className="border-brand-border bg-brand-softer p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
                <IconTarget className="size-5" />
              </span>
              <div className="max-w-2xl">
                <h2 className="text-[1.125rem] font-semibold tracking-tight text-ink">
                  Wir setzen eine Ebene früher an: bei der Ursache
                </h2>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-2">
                  Erklärungsbedürftige Produkte scheitern selten an der Qualität, sondern daran,
                  dass ihr Wert nicht schnell genug verstanden wird. Mehr Marketing verstärkt dann
                  oft nur ein Problem, das an anderer Stelle entsteht. Genau diese Stelle finden wir.
                </p>
                <Button as={Link} to="/problem" variant="secondary" size="sm" className="mt-5">
                  Das Problem im Detail
                  <IconArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {VISUALS.netzwerk.bild ? (
        <section className="bg-surface-inverse">
          <div className="shell-container py-14 lg:py-18">
            <MarketingBild visual={VISUALS.netzwerk} ratio="21 / 9" dunkel />
          </div>
        </section>
      ) : null}

      <ZielgruppeSection />

      <TeamSection />

      <CtaBand />
    </>
  )
}
