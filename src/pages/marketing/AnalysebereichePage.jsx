import { Link } from 'react-router-dom'
import { KATEGORIEN } from '../../data/catalog.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Abschnitt, CtaBand } from './parts.jsx'
import { ANALYSEBEREICHE } from '../../content/marketing.js'
import { IconArrowRight, IconChart, IconCheck, IconShare, IconTarget } from '../../components/ui/Icons.jsx'

const GRUPPEN = [
  { name: 'Strategie', icon: IconTarget, text: 'Wo stehen wir – und warum sollte der Markt genau uns wählen?' },
  { name: 'Kommunikation', icon: IconShare, text: 'Wird der Wert schnell, konsistent und belegbar verstanden?' },
  { name: 'Markt', icon: IconChart, text: 'Entsteht aus Aktivität tatsächlich Nachfrage und Übergabe?' },
]

const FELDER = [
  ['Reifegrad', '0–100', 'Wie stark ist diese Dimension heute ausgeprägt?'],
  ['Beobachtung', 'Was sehen wir?', 'Konkrete Signale in Material, Markt und Prozess.'],
  ['Ursache', 'Warum passiert es?', 'Die strategische Erklärung hinter dem sichtbaren Symptom.'],
  ['Auswirkung', 'Was kostet es?', 'Wirtschaftliche Konsequenz oder verlorene Wirkung.'],
  ['Empfehlung', 'Was zuerst?', 'Der nächste sinnvolle Schritt – nicht zehn Maßnahmen gleichzeitig.'],
  ['Evidenz', 'Worauf basiert es?', 'Quelle, Dokument, Beobachtung und Confidence.'],
  ['Priorität', 'Wie dringend?', 'Handlungsdruck für die Reihenfolge im 90-Tage-Plan.'],
]

export function AnalysebereichePage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-20">
            <div>
              <p className="eyebrow">{ANALYSEBEREICHE.label}</p>
              <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[3.35rem]">Zehn Fragen. Ein Systembild.</h1>
            </div>
            <div>
              <p className="max-w-2xl text-[1rem] leading-7 text-ink-2">{ANALYSEBEREICHE.text}</p>
              <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
                {[['10', 'Dimensionen'], ['3', 'Systemgruppen'], ['7', 'Felder je Finding'], ['3', 'Top-Ursachen']].map(([value, label]) => <div key={label} className="bg-canvas px-4 py-3"><p className="text-lg font-semibold tracking-tight text-ink">{value}</p><p className="text-[0.68rem] text-ink-3">{label}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-[#0b1220] text-white">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200/70">Diagnosis matrix</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[2.4rem]">Jede Dimension hat eine Leitfrage – und einen Platz im Gesamtsystem.</h2>
              <p className="mt-4 text-[0.9rem] leading-7 text-white/55">Ein einzelner Score erklärt wenig. Entscheidend ist, welche Schwächen miteinander zusammenhängen und welche Ursache mehrere Symptome gleichzeitig erzeugt.</p>
            </div>

            <div className="space-y-7">
              {GRUPPEN.map(({ name, icon: Icon, text }) => {
                const items = KATEGORIEN.filter((item) => item.gruppe === name)
                return (
                  <div key={name}>
                    <div className="mb-3 flex items-center gap-3"><span className="inline-flex size-9 items-center justify-center rounded-xl bg-white/[0.07] text-emerald-200"><Icon className="size-4" /></span><div><h3 className="text-sm font-semibold text-white">{name}</h3><p className="text-[0.72rem] text-white/40">{text}</p></div></div>
                    <div className="divide-y divide-white/10 border-y border-white/10">
                      {items.map((item, index) => (
                        <div key={item.id} className="grid gap-2 py-4 sm:grid-cols-[2.5rem_0.65fr_1.35fr] sm:gap-4">
                          <span className="text-[0.68rem] font-semibold tabular text-white/25">{String(index + 1).padStart(2, '0')}</span>
                          <p className="text-[0.82rem] font-semibold text-white/80">{item.label}</p>
                          <p className="text-[0.76rem] leading-relaxed text-white/48">{item.frage}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <Abschnitt eyebrow="Was aus jeder Dimension entsteht" headline="Ein Finding muss überprüfbar sein – nicht nur überzeugend klingen." text="Deshalb wird jede Dimension in dieselbe operative Struktur übersetzt. Das macht Analysepunkte vergleichbar, prüfbar und direkt für Freigabe und Umsetzung nutzbar." hell>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
          {FELDER.map(([title, value, text], index) => (
            <article key={title} className={`bg-surface p-5 sm:p-6 ${index === 0 ? 'xl:bg-brand-softer' : ''}`}>
              <div className="flex items-center justify-between"><span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-3">{title}</span><span className="text-xs font-semibold tabular text-ink-3">0{index + 1}</span></div>
              <p className="mt-4 text-base font-semibold tracking-tight text-ink">{value}</p>
              <p className="mt-2 text-[0.76rem] leading-relaxed text-ink-2">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-canvas p-4">
          <span className="mr-2 text-xs font-semibold text-ink-2">Reifegrad</span>
          <Chip toneName="danger">Kritisch · 0–39</Chip><Chip toneName="warn">Auffällig · 40–57</Chip><Chip toneName="info">Solide · 58–74</Chip><Chip toneName="ok">Stark · ab 75</Chip>
        </div>
        <Button as={Link} to="/demo/analyse" variant="secondary" className="mt-7">Analyse im Produkt ansehen <IconArrowRight className="size-4" /></Button>
      </Abschnitt>

      <section className="border-b border-line bg-surface">
        <div className="shell-container py-14 lg:py-18">
          <div className="rounded-2xl border border-brand-border bg-brand-softer p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
              <div><p className="eyebrow">Das Entscheidende</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">Nicht der niedrigste Score gewinnt automatisch.</h2></div>
              <div className="grid gap-2 sm:grid-cols-3">{['Beleglage', 'wirtschaftlicher Hebel', 'Abhängigkeit zu anderen Ursachen'].map((item) => <div key={item} className="flex items-start gap-2 rounded-xl bg-surface px-4 py-3 text-[0.78rem] font-medium text-ink-2"><IconCheck className="mt-0.5 size-4 shrink-0 text-ok-ink" />{item}</div>)}</div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand titel="Sehen Sie die zehn Dimensionen im echten Workflow." text="Die Demo zeigt, wie aus Leitfragen Findings, Freigaben, Impact und ein priorisierter 90-Tage-Plan werden." primaer={{ to: '/demo', label: 'Diagnosis OS ansehen' }} sekundaer={{ to: '/funktionsweise', label: 'So funktioniert die Diagnose' }} />
    </>
  )
}
