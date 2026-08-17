import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/primitives.jsx'
import { Abschnitt, CtaBand } from './parts.jsx'
import { ANGEBOT, INVESTITION, UEBER_UNS } from '../../content/marketing.js'
import { IconArrowRight, IconCheck, IconShield, IconTarget } from '../../components/ui/Icons.jsx'

export function AngebotPage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-20">
            <div>
              <p className="eyebrow">{ANGEBOT.label}</p>
              <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[3.35rem]">Eine Diagnose, auf die Sie Entscheidungen bauen können.</h1>
            </div>
            <div>
              <p className="max-w-2xl text-[1rem] leading-7 text-ink-2">{ANGEBOT.text}</p>
              <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
                {ANGEBOT.fakten.map((fakt) => <div key={fakt.label} className="bg-canvas px-4 py-3"><p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink-3">{fakt.label}</p><p className="mt-1 text-sm font-semibold text-ink">{fakt.wert}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-[#0b1220] text-white">
        <div className="shell-container py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
            <div>
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white text-[#0b1220]"><IconTarget className="size-5" /></span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200/70">Leistungsumfang</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[2.45rem]">Ein fester Outcome statt eines Agentur-Baukastens.</h2>
              <p className="mt-4 text-[0.9rem] leading-7 text-white/55">Die Analyse ist darauf ausgelegt, am Ende eine priorisierte Entscheidungslage zu erzeugen. Nicht möglichst viele Einzelleistungen.</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {ANGEBOT.leistungen.map((leistung, index) => (
                <div key={leistung} className="flex items-start gap-3 bg-[#0b1220] p-5 sm:p-6">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-300/10 text-emerald-200"><IconCheck className="size-3.5" /></span>
                  <div><span className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white/25">0{index + 1}</span><p className="mt-1 text-[0.8rem] leading-relaxed text-white/68">{leistung}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-canvas">
        <div className="shell-container py-16 lg:py-24">
          <div className="overflow-hidden rounded-[2rem] border border-brand-border bg-surface shadow-xl shadow-black/5">
            <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
              <div className="flex flex-col justify-between bg-brand p-7 text-on-brand sm:p-10 lg:p-12">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-brand/65">{INVESTITION.label}</p>
                  <p className="mt-6 text-[2rem] font-semibold leading-none tracking-[-0.035em] sm:text-[2.7rem]">{INVESTITION.rahmen}</p>
                  <p className="mt-3 text-[0.8rem] leading-relaxed text-on-brand/72">{INVESTITION.rahmenLabel}</p>
                </div>
                <p className="mt-10 text-xs leading-relaxed text-on-brand/60">Keine Rabatte, keine Countdown-Timer, keine künstliche Verknappung.</p>
              </div>
              <div className="p-7 sm:p-10 lg:p-12">
                <p className="eyebrow">Wofür Sie bezahlen</p>
                <h2 className="mt-3 text-[1.8rem] font-semibold leading-tight tracking-[-0.025em] text-ink">Für Klarheit vor der nächsten größeren Investition.</h2>
                <p className="mt-4 text-[0.9rem] leading-7 text-ink-2">{INVESTITION.zusatz}</p>
                <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-3">{INVESTITION.hinweis}</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {['Diagnose', 'Entscheidungsvorlage', '90-Tage-Plan'].map((item, index) => <div key={item} className="rounded-xl border border-line bg-canvas p-4"><span className="text-[0.65rem] font-semibold text-brand-ink">0{index + 1}</span><p className="mt-2 text-[0.78rem] font-semibold text-ink">{item}</p></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Abschnitt eyebrow={UEBER_UNS.label} headline="Keine klassische Agenturlogik" text={UEBER_UNS.text}>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {UEBER_UNS.prinzipien.map((prinzip, index) => (
            <article key={prinzip.titel} className="bg-surface p-6 sm:p-7">
              <div className="flex items-center justify-between"><span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">{index === 0 ? <IconTarget className="size-5" /> : <IconShield className="size-5" />}</span><span className="text-xs font-semibold tabular text-ink-3">0{index + 1}</span></div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{prinzip.titel}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{prinzip.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-5 rounded-2xl border border-line bg-canvas p-6 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-semibold text-ink">Erst prüfen, dann entscheiden.</p><p className="mt-1 max-w-2xl text-[0.8rem] leading-relaxed text-ink-2">Im ersten Gespräch klären wir, ob die Ausgangslage überhaupt zu unserem Diagnosemodell passt. Wenn nicht, sagen wir das.</p></div>
          <Button as={Link} to="/termin" variant="secondary" className="shrink-0">Gespräch anfragen <IconArrowRight className="size-4" /></Button>
        </div>
      </Abschnitt>

      <CtaBand titel="Die teuerste Maßnahme ist die, die das falsche Problem löst." text="Ein kurzes Diagnosegespräch reicht, um zu prüfen, ob eine Ursachenanalyse für Ihre aktuelle Situation sinnvoll ist." primaer={{ to: '/termin', label: '15-Minuten-Gespräch anfragen' }} sekundaer={{ to: '/faq', label: 'Häufige Fragen' }} />
    </>
  )
}
