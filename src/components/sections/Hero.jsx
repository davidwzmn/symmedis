import { HERO, KENNZAHLEN, URSACHEN } from '../../content/site.js'
import { scrollToSection } from '../../lib/scroll.js'
import { Button } from '../ui/Button.jsx'
import { IconArrowRight, IconCalendar } from '../ui/Icons.jsx'
import { Reveal } from '../ui/Reveal.jsx'

/** Beispielhafte Vorschau – klar als fiktive Demo-Darstellung gekennzeichnet. */
const VORSCHAU = [
  { label: 'Positionierung', wert: 34 },
  { label: 'Verständlichkeit', wert: 46 },
  { label: 'Differenzierung', wert: 41 },
  { label: 'Marktaktivierung', wert: 62 },
]

export function Hero({ onOpenDemo }) {
  return (
    <section id="start" aria-labelledby="hero-headline" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-veil" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-marine-100/50 blur-3xl dark:bg-marine-900/25"
      />

      <div className="container-page relative pt-28 pb-16 sm:pt-32 md:pb-20 lg:pt-40 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-16">
          <div>
            <Reveal
              as="p"
              className="inline-flex flex-wrap items-center gap-2 rounded-full border border-shell-200 bg-white/70 px-3.5 py-1.5 text-[0.6875rem] font-medium tracking-[0.06em] text-marine-800 uppercase dark:border-night-700 dark:bg-night-900/70 dark:text-night-200"
            >
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-brass-500 dark:bg-brass-400"
              />
              {HERO.badge}
            </Reveal>

            <Reveal
              as="h1"
              delay={60}
              id="hero-headline"
              className="mt-6 text-[2rem] leading-[1.12] sm:text-[2.6rem] lg:text-[3.25rem]"
            >
              {HERO.headline}
            </Reveal>

            <Reveal
              as="p"
              delay={120}
              className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed prose-muted"
            >
              {HERO.text}
            </Reveal>

            <Reveal delay={180} className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button size="lg" onClick={() => scrollToSection('termin')}>
                <IconCalendar className="size-4.5" />
                {HERO.ctaPrimary}
              </Button>
              <Button size="lg" variant="secondary" onClick={onOpenDemo}>
                {HERO.ctaSecondary}
                <IconArrowRight className="size-4.5" />
              </Button>
            </Reveal>

            <Reveal
              as="dl"
              delay={240}
              className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-shell-200 pt-8 sm:grid-cols-4 dark:border-night-800"
            >
              {KENNZAHLEN.map((kennzahl) => (
                <div key={kennzahl.wert}>
                  <dt className="font-serif text-[1.0625rem] leading-tight text-marine-900 dark:text-night-100">
                    {kennzahl.wert}
                  </dt>
                  <dd className="mt-1 text-[0.8125rem] leading-snug prose-muted">
                    {kennzahl.text}
                  </dd>
                </div>
              ))}
            </Reveal>
          </div>

          {/* Vorschau-Karte */}
          <Reveal delay={300} className="lg:justify-self-end">
            <div className="surface w-full overflow-hidden shadow-[0_1px_2px_rgba(15,34,42,0.05),0_18px_40px_-24px_rgba(15,34,42,0.35)]">
              <div className="flex items-center justify-between gap-3 border-b border-shell-200 px-5 py-3.5 dark:border-night-700">
                <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-marine-800 uppercase dark:text-night-200">
                  Ursachenprofil
                </p>
                <span className="rounded-full border border-shell-200 px-2 py-0.5 text-[0.625rem] tracking-wide text-shell-500 dark:border-night-700 dark:text-night-300">
                  Beispiel · fiktiv
                </span>
              </div>

              <div className="space-y-4 px-5 py-5">
                {VORSCHAU.map((eintrag, index) => (
                  <div key={eintrag.label}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[0.8125rem] text-marine-900 dark:text-night-200">
                        {eintrag.label}
                      </span>
                      <span className="font-serif text-sm text-shell-500 tabular-nums dark:text-night-300">
                        {eintrag.wert}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-shell-200 dark:bg-night-800">
                      <div
                        className="h-full origin-left rounded-full animate-bar"
                        style={{
                          width: `${eintrag.wert}%`,
                          animationDelay: `${400 + index * 110}ms`,
                          backgroundColor:
                            eintrag.wert < 40
                              ? 'var(--color-signal-critical)'
                              : eintrag.wert < 58
                                ? 'var(--color-signal-warn)'
                                : 'var(--color-signal-ok)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-shell-200 bg-shell-50 px-5 py-4 dark:border-night-700 dark:bg-night-800/60">
                <p className="text-[0.8125rem] leading-relaxed prose-muted">
                  Die vier häufigsten Ursachen, in einer Bewertung zusammengeführt – so entsteht der
                  90-Tage-Plan.
                </p>
                <button
                  type="button"
                  onClick={onOpenDemo}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-sm text-[0.8125rem] font-medium text-marine-700 underline decoration-brass-400 decoration-1 underline-offset-4 transition-colors hover:text-marine-900 dark:text-marine-300 dark:hover:text-night-100"
                >
                  Eigene Analyse in der Demo starten
                  <IconArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Die vier häufigsten Ursachen */}
        <Reveal
          as="ul"
          delay={120}
          className="mt-16 grid gap-px overflow-hidden rounded-sm border border-shell-200 bg-shell-200 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4 dark:border-night-700 dark:bg-night-700"
        >
          {URSACHEN.map((ursache) => (
            <li
              key={ursache.nummer}
              className="flex items-start gap-3 bg-white px-5 py-5 dark:bg-night-950"
            >
              <span className="font-serif text-[0.9375rem] text-brass-600 tabular-nums dark:text-brass-400">
                {ursache.nummer}
              </span>
              <span className="text-[0.9375rem] leading-snug text-marine-950 dark:text-night-100">
                {ursache.titel}
              </span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
