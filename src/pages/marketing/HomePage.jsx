import { Link } from 'react-router-dom'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { CtaBand } from './parts.jsx'
import { TeamSection } from './HomeSections.jsx'
import { GrowthSystemVisual } from './GrowthSystemVisual.jsx'
import {
  IconAlert,
  IconArrowRight,
  IconCalendar,
  IconChart,
  IconCheck,
  IconLayers,
  IconRoute,
  IconShield,
  IconSparkles,
  IconTarget,
} from '../../components/ui/Icons.jsx'

const FACTS = [
  ['10–14 Tage', 'bis zur strategischen Ergebnislage'],
  ['3 Ursachen', 'klar priorisiert statt Maßnahmenrauschen'],
  ['10 Bereiche', 'als zusammenhängendes Wachstumsmodell'],
  ['90 Tage', 'für die priorisierte Umsetzung'],
]

const HERO_PROOF = [
  'Für Health, MedTech und erklärungsbedürftige B2B-Produkte',
  'Belege und Prüfstatus zu jedem relevanten Finding',
  'Menschliche Freigabe statt automatischer Veröffentlichung',
]

const SYMPTOMS = [
  {
    title: '„Wir brauchen mehr Leads.“',
    text: 'Vielleicht. Oder die richtigen Menschen verstehen den Wert des Angebots nicht schnell genug.',
  },
  {
    title: '„Die Website konvertiert nicht.“',
    text: 'Vielleicht. Oder Website und Vertrieb erzählen zwei unterschiedliche Nutzenversprechen.',
  },
  {
    title: '„Die Konkurrenz ist günstiger.“',
    text: 'Vielleicht. Oder Ihre Differenzierung ist intern klar, aber für den Markt nicht ausreichend belegbar.',
  },
]

const OUTCOMES = [
  {
    icon: IconTarget,
    label: 'Diagnose',
    title: 'Sie wissen, was Wachstum tatsächlich bremst.',
    text: 'Nicht die lauteste Vermutung gewinnt, sondern die Ursache mit der stärksten Beleglage und dem größten wirtschaftlichen Hebel.',
  },
  {
    icon: IconShield,
    label: 'Entscheidung',
    title: 'Hypothese und freigegebenes Ergebnis bleiben getrennt.',
    text: 'Beobachtung, Ursache, Quelle und Prüfstatus bleiben nachvollziehbar. Nichts wird ungeprüft zum Kundenergebnis.',
  },
  {
    icon: IconRoute,
    label: 'Umsetzung',
    title: 'Aus Erkenntnis wird eine belastbare Reihenfolge.',
    text: 'Priorisierte Ursachen werden in konkrete Maßnahmen mit Verantwortung, Fälligkeit und Messgröße übersetzt.',
  },
]

const METHOD = [
  ['01', 'Kontext', 'Unterlagen, Website, Vertrieb, Markt und vorhandene Evidenz werden strukturiert zusammengeführt.'],
  ['02', 'Diagnose', 'Zehn Analysebereiche werden einzeln bewertet und anschließend als zusammenhängendes System betrachtet.'],
  ['03', 'Prüfung', 'Die wichtigsten Ursachen werden mit Belegen, Prüfstatus und menschlicher Freigabe abgesichert.'],
  ['04', 'Umsetzung', 'Aus den priorisierten Findings entsteht ein konkreter 30/60/90-Tage-Plan.'],
]

const PLATFORM_POINTS = [
  { icon: IconChart, title: 'Analyse', text: 'Beobachtung, Ursache, Auswirkung, Empfehlung und Priorität in einem strukturierten Modell.' },
  { icon: IconLayers, title: 'Evidenz', text: 'Dokumente, Quellen und Findings bleiben nachvollziehbar miteinander verbunden.' },
  { icon: IconShield, title: 'Freigabe', text: 'Interne Prüfung und Kundenfreigabe sind technisch und organisatorisch getrennt.' },
  { icon: IconRoute, title: 'Umsetzung', text: 'Aufgaben, Zuständigkeiten, Termine und Messgrößen bleiben im gleichen Projektkontext.' },
]

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-45" />
        <div className="shell-container relative py-14 sm:py-18 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 xl:gap-20">
            <div className="min-w-0">
              <Chip toneName="brand" icon={IconSparkles}>SYMMEDIS Diagnosis OS</Chip>
              <p className="mt-6 text-xs font-semibold tracking-wide text-brand-ink">STRATEGISCHE URSACHENANALYSE FÜR GESUNDHEITSUNTERNEHMEN</p>
              <h1 className="mt-4 max-w-3xl text-[2.55rem] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[3.65rem] lg:text-[4.35rem]">
                Wir finden heraus, warum Ihr Wachstum stockt.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-ink-2 sm:text-[1.08rem]">
                SYMMEDIS identifiziert in 10–14 Tagen die drei größten Wachstumsbremsen und übersetzt sie in einen priorisierten 90-Tage-Plan – softwaregestützt, belegt und menschlich freigegeben.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button as={Link} to="/termin" variant="cta" size="lg">
                  <IconCalendar className="size-4 shrink-0" /> Diagnosegespräch anfragen
                </Button>
                <Button as={Link} to="/demo" variant="secondary" size="lg">
                  Diagnosis OS ansehen <IconArrowRight className="size-4 shrink-0" />
                </Button>
              </div>

              <div className="mt-8 space-y-2.5">
                {HERO_PROOF.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-ink-2">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok-ink">
                      <IconCheck className="size-3.5 shrink-0" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <GrowthSystemVisual />
          </div>

          <dl className="mt-12 grid overflow-hidden rounded-2xl border border-line bg-surface shadow-sm sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {FACTS.map(([value, label], index) => (
              <div key={value} className={`px-5 py-5 sm:px-6 ${index ? 'border-t border-line sm:border-t-0 sm:[&:nth-child(odd)]:border-l lg:border-l' : ''} ${index === 2 ? 'sm:border-t lg:border-t-0' : ''}`}>
                <dt className="text-xl font-semibold tracking-tight text-ink">{value}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-ink-2">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-b border-line bg-canvas">
        <div className="shell-container py-16 lg:py-22">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div>
              <Chip toneName="brand" icon={IconAlert}>Das eigentliche Problem</Chip>
              <h2 className="mt-5 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.65rem]">
                Mehr Aktivität löst kein strategisches Systemproblem.
              </h2>
              <p className="mt-5 max-w-xl text-[0.95rem] leading-7 text-ink-2">
                Wenn Positionierung, Nutzenargumentation, Website und Vertrieb nicht dieselbe Geschichte erzählen, wird zusätzliche Reichweite häufig nur teurer. SYMMEDIS setzt deshalb eine Ebene früher an: bei der Ursache.
              </p>
              <Button as={Link} to="/problem" variant="secondary" className="mt-7">
                Warum Symptome teuer werden <IconArrowRight className="size-4 shrink-0" />
              </Button>
            </div>

            <div className="space-y-3">
              {SYMPTOMS.map((item, index) => (
                <article key={item.title} className="grid gap-3 rounded-2xl border border-line bg-surface p-5 shadow-xs sm:grid-cols-[2rem_0.85fr_1.15fr] sm:items-start sm:gap-5 sm:p-6">
                  <span className="text-xs font-semibold tabular text-ink-3">0{index + 1}</span>
                  <h3 className="text-base font-semibold leading-snug text-ink">{item.title}</h3>
                  <p className="text-[0.8125rem] leading-relaxed text-ink-2">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="shell-container py-16 lg:py-22">
          <div className="max-w-3xl">
            <p className="eyebrow">Was am Ende feststeht</p>
            <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.55rem]">
              Nicht mehr Daten. Bessere Entscheidungen.
            </h2>
            <p className="mt-4 text-[0.95rem] leading-7 text-ink-2">
              Diagnosis OS schafft eine belastbare Reihenfolge zwischen Beobachtung, Ursache, Auswirkung und nächster Aktion.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {OUTCOMES.map(({ icon: Icon, label, title, text }) => (
              <article key={title} className="rounded-2xl border border-line bg-canvas p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                    <Icon className="size-5 shrink-0" />
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-brand-ink">{label}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold leading-snug tracking-tight text-ink">{title}</h3>
                <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-2">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface-muted">
        <div className="shell-container py-16 lg:py-22">
          <div className="max-w-3xl">
            <p className="eyebrow">Von der Vermutung zur Entscheidung</p>
            <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.55rem]">
              Ein klarer Prüfpfad statt einer Blackbox.
            </h2>
            <p className="mt-4 text-[0.95rem] leading-7 text-ink-2">
              Software strukturiert den Prozess. Die strategische Bewertung und Freigabe bleiben menschlich.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {METHOD.map(([number, title, text]) => (
              <article key={number} className="rounded-2xl border border-line bg-surface p-6">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-soft text-xs font-semibold text-brand-ink">{number}</span>
                <h3 className="mt-5 text-base font-semibold text-ink">{title}</h3>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-2">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="shell-container py-16 lg:py-22">
          <div className="overflow-hidden rounded-[1.75rem] bg-surface-inverse p-6 shadow-lg sm:p-9 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
              <div>
                <p className="text-xs font-semibold tracking-wide text-canvas/70">DIAGNOSIS OS</p>
                <h2 className="mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-canvas sm:text-[2.55rem]">
                  Ein Arbeitsraum für die Entscheidung – nicht nur ein Bericht.
                </h2>
                <p className="mt-5 text-[0.95rem] leading-7 text-canvas/80">
                  Analyse, Evidenz, Freigabe, Aufgaben, Dokumente und Kundenkommunikation bleiben in einem nachvollziehbaren Projektkontext.
                </p>
                <Button as={Link} to="/plattform" variant="on-dark" size="lg" className="mt-7">
                  Plattform im Detail <IconArrowRight className="size-4 shrink-0" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {PLATFORM_POINTS.map(({ icon: Icon, title, text }) => (
                  <article key={title} className="rounded-2xl border border-canvas/15 bg-canvas/5 p-5">
                    <Icon className="size-5 text-canvas/80" />
                    <h3 className="mt-4 text-base font-semibold text-canvas">{title}</h3>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-canvas/75">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-canvas">
        <div className="shell-container py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
            <div>
              <p className="eyebrow">Für wen SYMMEDIS gedacht ist</p>
              <h2 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[2.2rem]">
                Für Unternehmen, die keine weitere Maßnahme ohne klare Diagnose starten wollen.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Gesundheitsmarkt, MedTech und Diagnostik',
                'Vitalstoffe und erklärungsbedürftige Premium-Produkte',
                'Digital Health, Therapie- und Praxiskonzepte',
                'Unternehmen mit Marketinginvestitionen und unklarer Wirkung',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-[0.8125rem] leading-relaxed text-ink-2">
                  <IconCheck className="mt-0.5 size-4 shrink-0 text-ok-ink" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TeamSection />

      <CtaBand
        titel="Herausfinden, was Ihr Wachstum wirklich bremst"
        text="Starten Sie mit einem 15-minütigen Diagnosegespräch – oder sehen Sie sich zuerst das Diagnosis OS an."
        primaer={{ to: '/termin', label: 'Diagnosegespräch anfragen' }}
        sekundaer={{ to: '/demo', label: 'Diagnosis OS ansehen' }}
      />
    </>
  )
}
