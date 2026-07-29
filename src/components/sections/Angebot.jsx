import { ANGEBOT } from '../../content/site.js'
import { Button } from '../ui/Button.jsx'
import { IconCheck, IconSparkles } from '../ui/Icons.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { SectionHeading } from './SectionHeading.jsx'

export function Angebot({ onOpenDemo }) {
  return (
    <section id="angebot" aria-labelledby="angebot-headline" className="py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <SectionHeading
          label={ANGEBOT.label}
          headline={ANGEBOT.headline}
          text={ANGEBOT.text}
          headlineId="angebot-headline"
        />

        {/* items-start: sonst wird die Leistungs-Karte auf die Höhe der
            Fakten-Box gestreckt und bekommt unten eine tote Fläche. */}
        <div className="mt-14 grid items-start gap-6 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          <Reveal className="surface p-6 sm:p-8">
            <h3 className="text-base font-medium tracking-wide text-marine-900 dark:text-night-100">
              Leistungen
            </h3>
            <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {ANGEBOT.leistungen.map((leistung) => (
                <li key={leistung} className="flex items-start gap-3">
                  <IconCheck
                    className="mt-1 size-4 shrink-0 text-brass-500 dark:text-brass-400"
                    strokeWidth={2.2}
                  />
                  <span className="text-[0.9375rem] leading-relaxed text-marine-950 dark:text-night-200">
                    {leistung}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Fakten-Box */}
          <Reveal
            delay={100}
            className="flex flex-col rounded-sm border border-marine-800 bg-marine-800 p-6 text-white sm:p-8 dark:border-marine-700 dark:bg-marine-900"
          >
            <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-brass-300 uppercase">
              Auf einen Blick
            </p>

            <dl className="mt-6 space-y-4">
              {ANGEBOT.fakten.map((fakt) => (
                <div
                  key={fakt.label}
                  className="flex items-baseline justify-between gap-4 border-b border-white/12 pb-4 last:border-0 last:pb-0"
                >
                  <dt className="text-[0.8125rem] text-marine-200">{fakt.label}</dt>
                  <dd className="text-right font-serif text-[0.9375rem] text-white">{fakt.wert}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 pt-1">
              <Button variant="accent" fullWidth onClick={onOpenDemo}>
                <IconSparkles className="size-4" />
                {ANGEBOT.cta}
              </Button>
              <p className="mt-3 text-center text-[0.75rem] leading-relaxed text-marine-200">
                Beta-Demo mit fiktiven Daten – kostenlos und ohne Anmeldung.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
