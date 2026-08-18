import { Link } from 'react-router-dom'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { CtaBand, Vertrauensleiste } from './parts.jsx'
import { ZielgruppeSection, TeamSection } from './HomeSections.jsx'
import { GrowthSystemVisual } from './GrowthSystemVisual.jsx'
import { HERO } from '../../content/marketing.js'
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

const OUTCOMES = [
  {
    icon: IconTarget,
    kicker: '01 · Diagnose',
    title: 'Sie wissen, was Wachstum wirklich bremst.',
    text: 'Nicht die lauteste Vermutung gewinnt, sondern die Ursache mit der stärksten Beleglage und dem größten wirtschaftlichen Hebel.',
  },
  {
    icon: IconShield,
    kicker: '02 · Entscheidung',
    title: 'Hypothese und freigegebene Wahrheit bleiben getrennt.',
    text: 'Jedes Finding hat Quelle, Confidence und Prüfstatus. Nichts wird automatisch zum Kundenergebnis erklärt.',
  },
  {
    icon: IconRoute,
    kicker: '03 · Umsetzung',
    title: 'Aus Erkenntnis wird eine Reihenfolge.',
    text: 'Priorisierte Ursachen werden in einen 30/60/90-Tage-Plan mit Verantwortung, Fälligkeit und messbarem Ziel übersetzt.',
  },
]

const PROCESS = [
  ['01', 'Kontext erfassen', 'Unterlagen, Website, Vertrieb, Markt und bestehende Evidenz werden zu einem strukturierten Projektbild zusammengeführt.'],
  ['02', 'System diagnostizieren', 'Zehn Dimensionen werden einzeln bewertet und anschließend als zusammenhängendes Wachstumsmodell betrachtet.'],
  ['03', 'Ursachen priorisieren', 'Die drei wichtigsten Wachstumsbremsen werden mit Beleg, Confidence und wirtschaftlicher Relevanz herausgearbeitet.'],
  ['04', 'Entscheiden & umsetzen', 'Menschliche Freigabe, Management-Report und 90-Tage-Plan schaffen einen klaren nächsten Schritt.'],
]

const PRODUCT_MODULES = [
  ['Diagnosis', '10 Dimensionen', 'Score, Beobachtung, Ursache, Auswirkung, Empfehlung, Evidenz und Confidence.'],
  ['Evidence', 'Projektwissen', 'Dokumente, Quellen und Findings bleiben nachvollziehbar mit dem Projekt verbunden.'],
  ['Impact', 'Verifizierter ROI', 'Potenziale zählen erst, wenn Annahmen gegen reale Kundendaten geprüft wurden.'],
  ['Execution', '90-Tage-Plan', 'Aus priorisierten Findings entstehen sequenzierte Aufgaben und Messgrößen.'],
]

const PROOF = [
  'Health, MedTech & erklärungsbedürftige B2B-Produkte',
  'Mandantensicheres Kunden- und Mitarbeiterportal',
  'Human-in-the-loop statt automatischer Veröffentlichung',
  'Von Diagnose bis Umsetzung in einem Arbeitsraum',
]

export function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#07101d] text-white">
        <div aria-hidden="true" className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 15% 10%, rgba(94,129,255,.26), transparent 30%), radial-gradient(circle at 88% 28%, rgba(83,224,189,.14), transparent 27%)' }} />
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="shell-container relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 xl:gap-20">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur">
                  <IconSparkles className="size-3.5 shrink-0 text-emerald-200" /> SYMMEDIS Diagnosis OS
                </span>
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/50">Strategic Growth Intelligence</span>
              </div>

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/90">{HERO.eyebrow}</p>
              <h1 className="mt-4 max-w-3xl text-[2.45rem] font-semibold leading-[1.01] tracking-[-0.045em] text-white min-[380px]:text-[2.65rem] sm:text-[3.65rem] lg:text-[4.25rem]">
                Wachstum ist ein System. Wir zeigen, wo es bricht.
              </h1>
              <p className="mt-6 max-w-2xl text-[1rem] leading-7 text-white/75 sm:text-[1.08rem]">
                SYMMEDIS verbindet strategische Ursachenanalyse, Evidenz, menschliche Freigabe und Umsetzung in einem Diagnosis OS – damit Sie nicht mehr Budget auf Symptome werfen.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button as={Link} to="/termin" size="lg" className="border-white bg-white text-[#07101d] hover:bg-white/90">
                  <IconCalendar className="size-4 shrink-0" /> 15-Minuten-Diagnosegespräch
                </Button>
                <Button as={Link} to="/demo" size="lg" className="border border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.09]">
                  Diagnosis OS ansehen <IconArrowRight className="size-4 shrink-0" />
                </Button>
              </div>

              <div className="mt-8 grid max-w-xl gap-2 sm:grid-cols-2">
                {PROOF.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-white/65">
                    <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-300/10 text-emerald-200"><IconCheck className="size-3 shrink-0" /></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <GrowthSystemVisual />
          </div>

          <div className="mt-14 grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur sm:grid-cols-3">
            {[
              ['10–14 Tage', 'bis zur strategischen Ergebnislage'],
              ['3 Ursachen', 'statt 30 gleichwertiger Maßnahmen'],
              ['90 Tage', 'priorisierte Umsetzung mit Messgrößen'],
            ].map(([value, label], index) => (
              <div key={value} className={`px-5 py-5 sm:px-7 ${index ? 'border-t border-white/10 sm:border-l sm:border-t-0' : ''}`}>
                <p className="text-xl font-semibold tracking-tight text-white">{value}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Vertrauensleiste />

      <section className="border-b border-line bg-surface">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Chip toneName="brand" icon={IconAlert}>Das eigentliche Problem</Chip>
              <h2 className="mt-5 text-[2rem] font-semibold leading-[1.06] tracking-[-0.035em] text-ink sm:text-[2.6rem]">
                Mehr Aktivität löst kein Systemproblem.
              </h2>
              <p className="mt-5 text-[0.95rem] leading-7 text-ink-2">
                Wenn Positionierung, Nutzenargumentation, Website und Vertrieb nicht dieselbe Geschichte erzählen, wird mehr Reichweite häufig nur teurer. SYMMEDIS arbeitet deshalb eine Ebene früher: bei der Ursache.
              </p>
              <Button as={Link} to="/problem" variant="secondary" size="sm" className="mt-7">Warum Symptome teuer werden <IconArrowRight className="size-4 shrink-0" /></Button>
            </div>

            <div className="space-y-3">
              {[
                ['„Wir brauchen mehr Leads.“', 'Vielleicht. Oder die richtigen Menschen verstehen den Wert des Angebots nicht schnell genug.'],
                ['„Die Website konvertiert nicht.“', 'Vielleicht. Oder Vertrieb und Website argumentieren mit unterschiedlichen Nutzenversprechen.'],
                ['„Unsere Konkurrenz ist günstiger.“', 'Vielleicht. Oder Ihre Differenzierung ist intern klar, aber für den Markt nicht belegbar.'],
                ['„Social funktioniert nicht.“', 'Vielleicht. Oder Reichweite endet ohne einen logischen nächsten Schritt in der Customer Journey.'],
              ].map(([symptom, cause], index) => (
                <div key={symptom} className="group grid gap-4 rounded-2xl border border-line bg-canvas p-5 transition hover:border-brand-border sm:grid-cols-[2.3rem_0.85fr_1.15fr] sm:items-start sm:p-6">
                  <span className="text-xs font-semibold tabular text-ink-3">0{index + 1}</span>
                  <p className="text-[0.95rem] font-semibold leading-snug text-ink">{symptom}</p>
                  <p className="text-[0.8125rem] leading-relaxed text-ink-2">{cause}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-canvas">
        <div className="shell-container py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Was Sie danach anders wissen</p>
            <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.5rem]">Nicht mehr Daten. Bessere Entscheidungen.</h2>
            <p className="mt-4 text-[0.95rem] leading-7 text-ink-2">Diagnosis OS macht nicht alles gleich wichtig. Es schafft eine belastbare Reihenfolge zwischen Beobachtung, Ursache, Auswirkung und nächster Aktion.</p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-3">
            {OUTCOMES.map(({ icon: Icon, kicker, title, text }) => (
              <article key={title} className="bg-surface p-6 sm:p-8">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink"><Icon className="size-5 shrink-0" /></span>
                <p className="mt-7 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-3">{kicker}</p>
                <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-ink">{title}</h3>
                <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-2">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-b border-line bg-surface-muted">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="eyebrow">Diagnosis OS</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.55rem]">Ein Arbeitsraum für die Entscheidung – nicht nur ein Bericht.</h2>
              <p className="mt-5 text-[0.95rem] leading-7 text-ink-2">Analyse, Evidenz, Impact, Freigabe, Aufgaben, Dokumente und Kundenkommunikation bleiben in einem nachvollziehbaren Projektkontext.</p>
              <div className="mt-7 flex flex-wrap gap-2">
                <Chip toneName="ok" icon={IconShield}>Human reviewed</Chip>
                <Chip toneName="brand" icon={IconLayers}>Tenant isolated</Chip>
                <Chip toneName="accent" icon={IconChart}>Impact verified</Chip>
              </div>
              <Button as={Link} to="/plattform" className="mt-7" variant="secondary">Plattform im Detail <IconArrowRight className="size-4 shrink-0" /></Button>
            </div>

            <div className="min-w-0 overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-xl shadow-black/5 sm:rounded-[1.75rem]">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 border-b border-line bg-surface-muted px-4 py-3 sm:flex sm:justify-between">
                <div className="flex gap-1.5" aria-hidden="true"><span className="size-2.5 rounded-full bg-line-strong" /><span className="size-2.5 rounded-full bg-line-strong" /><span className="size-2.5 rounded-full bg-line-strong" /></div>
                <span className="min-w-0 truncate text-right text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink-3 sm:text-center sm:text-[0.65rem] sm:tracking-[0.13em]">SYMMEDIS · Project Intelligence</span>
                <span className="col-span-2 justify-self-end text-[0.6rem] font-semibold text-ok-ink sm:col-span-1 sm:text-[0.65rem]">Live workspace</span>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {PRODUCT_MODULES.map(([label, value, text], index) => (
                    <div key={label} className={`rounded-xl border p-4 ${index === 0 ? 'border-brand-border bg-brand-softer' : 'border-line bg-canvas'}`}>
                      <div className="flex items-center justify-between gap-3"><span className="text-[0.67rem] font-semibold uppercase tracking-[0.11em] text-ink-3">{label}</span><span className="size-1.5 shrink-0 rounded-full bg-accent" /></div>
                      <p className="mt-3 text-base font-semibold tracking-tight text-ink">{value}</p>
                      <p className="mt-1.5 text-[0.74rem] leading-relaxed text-ink-2">{text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-[#0b1220] p-4 text-white sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-white/50">Priority queue</p><p className="mt-1 text-sm font-semibold text-white">Die drei stärksten Wachstumshebel</p></div><span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-[0.65rem] font-semibold text-emerald-200">reviewed</span></div>
                  <div className="mt-4 space-y-2">
                    {['Nutzenargumentation konsistent machen', 'Positionierung im Vertrieb schärfen', 'Website → Sales-Handoff schließen'].map((item, index) => (
                      <div key={item} className="flex min-w-0 items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 sm:gap-3"><span className="shrink-0 text-[0.68rem] font-semibold tabular text-white/45">0{index + 1}</span><span className="min-w-0 flex-1 text-[0.76rem] leading-snug text-white/80">{item}</span><IconArrowRight className="size-3.5 shrink-0 text-white/45" /></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="eyebrow">Der Ablauf</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.45rem]">Von der Vermutung zur belastbaren Priorität.</h2>
              <p className="mt-4 text-[0.95rem] leading-7 text-ink-2">Software beschleunigt Struktur und Retrieval. Die strategische Verantwortung bleibt bewusst beim Menschen.</p>
            </div>

            <ol className="relative space-y-0 border-l border-line pl-6 sm:pl-8">
              {PROCESS.map(([number, title, text], index) => (
                <li key={number} className={`relative pb-9 ${index === PROCESS.length - 1 ? 'pb-0' : ''}`}>
                  <span className="absolute -left-[2.15rem] top-0 inline-flex size-5 items-center justify-center rounded-full border-4 border-surface bg-brand sm:-left-[2.65rem]" />
                  <div className="grid gap-2 sm:grid-cols-[4rem_1fr] sm:gap-5">
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-brand-ink">{number}</span>
                    <div><h3 className="text-base font-semibold tracking-tight text-ink">{title}</h3><p className="mt-2 max-w-2xl text-[0.8125rem] leading-relaxed text-ink-2">{text}</p></div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-canvas">
        <div className="shell-container py-16 lg:py-24">
          <div className="overflow-hidden rounded-[2rem] border border-brand-border bg-brand-softer">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-7 sm:p-10 lg:p-12">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand text-on-brand"><IconShield className="size-6 shrink-0" /></span>
                <p className="eyebrow mt-7">Vertrauen ist Produktarchitektur</p>
                <h2 className="mt-3 max-w-xl text-[1.8rem] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[2.2rem]">KI darf helfen. Sie darf nicht heimlich entscheiden.</h2>
                <p className="mt-4 max-w-xl text-[0.9rem] leading-7 text-ink-2">SYMMEDIS trennt Vorschlag, interne Prüfung und Kundenfreigabe technisch voneinander. Interne Notizen, unfertige Reports und nicht freigegebene Dokumente bleiben außerhalb des Kundenportals.</p>
              </div>
              <div className="border-t border-brand-border bg-surface/70 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
                <ul className="space-y-4">
                  {[
                    'Row Level Security schützt Mandanten auf Datenbankebene.',
                    'Kundensichtbarkeit wird pro Finding, KPI und Dokument bewusst freigegeben.',
                    'Finale Reports erhalten unveränderliche Versions-Snapshots.',
                    'Bezahlte KI ist technisch deaktivierbar und aktuell standardmäßig gesperrt.',
                  ].map((item) => <li key={item} className="flex items-start gap-3 text-[0.8125rem] leading-relaxed text-ink-2"><span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok-ink"><IconCheck className="size-3.5 shrink-0" /></span>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ZielgruppeSection />
      <TeamSection />
      <CtaBand
        titel="Bevor Sie die nächste Maßnahme finanzieren: Finden Sie heraus, welche Ursache sie lösen soll."
        text="15 Minuten reichen für eine erste Einschätzung, ob SYMMEDIS in Ihrer Situation sinnvoll ist. Keine Präsentation, kein künstlicher Druck."
        primaer={{ to: '/termin', label: 'Diagnosegespräch anfragen' }}
        sekundaer={{ to: '/demo', label: 'Diagnosis OS ansehen' }}
      />
    </>
  )
}
