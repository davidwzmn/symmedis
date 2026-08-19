import { Link } from 'react-router-dom'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { CtaBand } from './parts.jsx'
import { TeamSection } from './HomeSections.jsx'
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
  'Klarheit statt Maßnahmenrauschen',
  'Evidenzbasierte Priorisierung',
  'Menschliche Freigabe statt Blackbox',
  'Von der Diagnose bis zur Umsetzung in einem System',
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
    label: 'Klare Prioritäten',
    title: 'Sie wissen, welche Ursachen zuerst gelöst werden müssen.',
    text: 'Nicht jede Schwachstelle ist gleich wichtig. SYMMEDIS priorisiert die Faktoren mit dem größten strategischen und wirtschaftlichen Hebel.',
  },
  {
    icon: IconShield,
    label: 'Nachvollziehbare Entscheidungen',
    title: 'Wissen, Annahmen und freigegebene Erkenntnisse bleiben getrennt.',
    text: 'Beobachtung, Evidenz, Hypothese und Prüfstatus bleiben nachvollziehbar dokumentiert. Nichts wird ungeprüft zum Kundenergebnis.',
  },
  {
    icon: IconRoute,
    label: 'Konkrete Umsetzung',
    title: 'Aus Erkenntnissen werden priorisierte nächste Schritte.',
    text: 'Die relevanten Ursachen werden in einen umsetzbaren Plan mit Verantwortung, Fälligkeit und Messgröße übersetzt.',
  },
]

const METHOD = [
  ['01', 'Kontext verstehen', 'Unternehmen, Angebot, Markt, Zielgruppen und Wachstumsfrage werden strukturiert erfasst.'],
  ['02', 'Ursachen analysieren', 'Die wichtigsten Einflussbereiche werden einzeln bewertet und anschließend als zusammenhängendes System betrachtet.'],
  ['03', 'Evidenz bewerten', 'Beobachtungen, Quellen und Hypothesen werden nach Relevanz, Sicherheit und möglicher Wirkung eingeordnet.'],
  ['04', 'Prioritäten festlegen', 'Die Ursachen mit dem größten Hebel werden menschlich geprüft, priorisiert und freigegeben.'],
  ['05', 'Umsetzung strukturieren', 'Aus den freigegebenen Erkenntnissen entsteht ein klarer 30/60/90-Tage-Plan.'],
]

const PLATFORM_POINTS = [
  { icon: IconChart, title: 'Analyse', text: 'Beobachtung, Ursache, Auswirkung, Empfehlung und Priorität in einem strukturierten Modell.' },
  { icon: IconLayers, title: 'Evidenz', text: 'Dokumente, Quellen und Erkenntnisse bleiben nachvollziehbar miteinander verbunden.' },
  { icon: IconShield, title: 'Freigabe', text: 'Interne Prüfung und Kundenfreigabe sind technisch und organisatorisch getrennt.' },
  { icon: IconRoute, title: 'Umsetzung', text: 'Aufgaben, Zuständigkeiten, Termine und Messgrößen bleiben im gleichen Projektkontext.' },
]

const TARGETS = [
  'Gesundheitsunternehmen und MedTech',
  'Diagnostik und erklärungsintensive Gesundheitsprodukte',
  'Vitalstoffe und Premium-Supplements',
  'Digital Health, Therapie- und Praxiskonzepte',
  'Erklärungsintensive B2B-Angebote mit komplexer Customer Journey',
]

const SITUATIONS = [
  'Wir investieren bereits viel in Marketing, aber der Umsatz entwickelt sich nicht entsprechend.',
  'Unsere Leistungen sind stark, aber der Markt versteht den Unterschied zum Wettbewerb nicht.',
  'Wir haben viele Maßnahmen – aber keine Klarheit, welche wirklich Priorität haben.',
  'Website, Marketing und Vertrieb funktionieren einzeln, aber nicht als geschlossenes System.',
  'Wir diskutieren intern über Ursachen, haben aber keine gemeinsame Faktenbasis.',
  'Wir wissen, dass etwas nicht stimmt – aber nicht, wo wir zuerst ansetzen müssen.',
]

const TRUST_MODEL = [
  ['Beobachtung', 'Was tatsächlich sichtbar oder messbar ist.'],
  ['Evidenz', 'Welche Informationen eine Aussage stützen.'],
  ['Hypothese', 'Welche mögliche Ursache daraus abgeleitet wird.'],
  ['Validierte Erkenntnis', 'Was nach Prüfung als belastbare Entscheidungsgrundlage freigegeben wird.'],
]

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-35" />
        <div className="shell-container relative py-14 sm:py-18 lg:py-24">
          <div className="grid items-start gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 xl:gap-20">
            <div className="min-w-0">
              <Chip toneName="brand" icon={IconSparkles}>Strategische Ursachenanalyse</Chip>
              <p className="mt-6 text-xs font-semibold tracking-wide text-brand-ink">FÜR HEALTH, MEDTECH UND ERKLÄRUNGSINTENSIVE B2B-ANGEBOTE</p>
              <h1 className="mt-4 max-w-4xl text-[2.55rem] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[3.65rem] lg:text-[4.35rem]">
                Wachstum stockt selten wegen mangelnder Aktivität. Meist fehlt die richtige Diagnose.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-ink-2 sm:text-[1.08rem]">
                SYMMEDIS identifiziert die Ursachen, die Wachstum tatsächlich begrenzen, strukturiert die Beleglage und übersetzt die relevanten Erkenntnisse in klare Prioritäten und konkrete nächste Schritte.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button as={Link} to="/termin" variant="cta" size="lg" className="shadow-sm">
                  <IconCalendar className="size-4 shrink-0" /> Diagnosegespräch anfragen
                </Button>
                <Button as={Link} to="/demo" variant="secondary" size="lg">
                  Plattform ansehen <IconArrowRight className="size-4 shrink-0" />
                </Button>
                <Button as={Link} to="/login" variant="ghost" size="lg">
                  Portal-Login
                </Button>
              </div>

              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-ink-3">
                15 Minuten · keine Verkaufsrunde · klare Einschätzung, ob eine Ursachenanalyse für Ihre Situation sinnvoll ist.
              </p>

              <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
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

            <aside className="rounded-[1.75rem] border border-line bg-canvas p-6 shadow-md sm:p-8">
              <p className="eyebrow">Was SYMMEDIS schafft</p>
              <h2 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-ink">
                Von der Wachstumsfrage zur belastbaren Entscheidung.
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-7 text-ink-2">
                Wir betrachten Positionierung, Angebot, Kommunikation, Website, Vertrieb und Markt nicht isoliert. Entscheidend ist, wie diese Faktoren zusammenwirken und welche Ursache welche Symptome erzeugt.
              </p>
              <div className="mt-7 space-y-3">
                {[
                  ['Ursachen statt Symptome', 'Wir prüfen, wo ein Problem tatsächlich entsteht.'],
                  ['Belegt statt behauptet', 'Relevante Erkenntnisse bleiben mit Quellen und Prüfstatus verbunden.'],
                  ['Priorisiert statt überladen', 'Nicht jede Erkenntnis wird zur Maßnahme.'],
                  ['Umsetzbar statt abstrakt', 'Aus der Diagnose entsteht ein klarer Handlungsplan.'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-xl border border-line bg-surface p-4">
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-2">{text}</p>
                  </div>
                ))}
              </div>
            </aside>
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
                Mehr Aktivität löst kein strukturelles Wachstumsproblem.
              </h2>
              <p className="mt-5 max-w-xl text-[0.95rem] leading-7 text-ink-2">
                Neue Kampagnen, neue Inhalte oder eine neue Website helfen nur, wenn sie an der richtigen Ursache ansetzen. SYMMEDIS betrachtet deshalb die Zusammenhänge zwischen Positionierung, Nutzenargumentation, Customer Journey, Vertrieb, Kommunikation und Markt.
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
            <p className="eyebrow">Was Sie mit SYMMEDIS gewinnen</p>
            <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.55rem]">
              Nicht mehr Information. Bessere Entscheidungssicherheit.
            </h2>
            <p className="mt-4 text-[0.95rem] leading-7 text-ink-2">
              Das Ziel ist nicht eine weitere Analyse. Das Ziel ist Klarheit darüber, was zuerst verändert werden muss und warum.
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
            <p className="eyebrow">Von der Wachstumsfrage zur Entscheidung</p>
            <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.55rem]">
              Ein klarer Prüfpfad statt einer Blackbox.
            </h2>
            <p className="mt-4 text-[0.95rem] leading-7 text-ink-2">
              Technologie strukturiert den Prozess. Die strategische Bewertung, Priorisierung und Freigabe bleiben menschlich.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
                <p className="text-xs font-semibold tracking-wide text-canvas/70">DIE PLATTFORM</p>
                <h2 className="mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-canvas sm:text-[2.55rem]">
                  Analyse, Entscheidung und Umsetzung in einem System.
                </h2>
                <p className="mt-5 text-[0.95rem] leading-7 text-canvas/80">
                  Analysen, Evidenz, Freigaben, Aufgaben, Dokumente und Kundenkommunikation bleiben in einem nachvollziehbaren Projektkontext – statt über Präsentationen, Tabellen und einzelne Chatverläufe verteilt zu sein.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button as={Link} to="/demo" variant="cta" size="lg">
                    Plattform ansehen <IconArrowRight className="size-4 shrink-0" />
                  </Button>
                  <Button as={Link} to="/plattform" variant="on-dark-secondary" size="lg">
                    Funktionen im Detail
                  </Button>
                </div>
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
        <div className="shell-container py-16 lg:py-22">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow">Für wen SYMMEDIS gedacht ist</p>
              <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[2.35rem]">
                Für Unternehmen, bei denen Wachstum mehr Erklärung braucht.
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-7 text-ink-2">
                Besonders relevant ist SYMMEDIS bei erklärungsintensiven Produkten, komplexen Customer Journeys oder hohen Anforderungen an Vertrauen, Differenzierung und Positionierung.
              </p>
              <div className="mt-7 space-y-3">
                {TARGETS.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-[0.8125rem] leading-relaxed text-ink-2">
                    <IconCheck className="mt-0.5 size-4 shrink-0 text-ok-ink" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow">Typische Ausgangssituationen</p>
              <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[2.35rem]">
                Vielleicht kennen Sie eine dieser Situationen.
              </h2>
              <div className="mt-7 grid gap-3">
                {SITUATIONS.map((item) => (
                  <blockquote key={item} className="rounded-xl border border-line bg-surface p-4 text-[0.875rem] leading-relaxed text-ink-2">
                    „{item}“
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="shell-container py-16 lg:py-22">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="eyebrow">Menschlich geprüft</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.55rem]">
                Technologie unterstützt die Analyse. Menschen verantworten die Entscheidung.
              </h2>
              <p className="mt-4 text-[0.95rem] leading-7 text-ink-2">
                Keine wichtige Erkenntnis wird allein deshalb wahr, weil ein System sie vorgeschlagen hat. SYMMEDIS trennt konsequent zwischen Beobachtung, Evidenz, Hypothese und freigegebener Erkenntnis.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {TRUST_MODEL.map(([title, text]) => (
                <article key={title} className="rounded-2xl border border-line bg-canvas p-5">
                  <h3 className="text-base font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TeamSection />

      <CtaBand
        titel="Bevor Sie die nächste Maßnahme starten, finden Sie heraus, ob sie überhaupt die richtige ist."
        text="Ein Diagnosegespräch dient dazu, Ihre aktuelle Wachstumsfrage einzuordnen und zu prüfen, ob eine strukturierte Ursachenanalyse für Ihre Situation sinnvoll ist."
        primaer={{ to: '/termin', label: 'Diagnosegespräch anfragen' }}
        sekundaer={{ to: '/demo', label: 'Plattform ansehen' }}
      />
    </>
  )
}
