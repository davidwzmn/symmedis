import { UEBER_UNS } from '../../content/site.js'
import { IconDocument, IconTeam, IconTarget } from '../ui/Icons.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { SectionHeading } from './SectionHeading.jsx'

const PRINZIPIEN = [
  {
    icon: IconTarget,
    titel: 'Ursache vor Symptom',
    text: 'Wir setzen eine Ebene früher an, bevor weiteres Budget in Sichtbarkeit fließt.',
  },
  {
    icon: IconTeam,
    titel: 'Menschlich geprüft',
    text: 'Die Software strukturiert. Bewertung und Empfehlung verantwortet unser Team.',
  },
  {
    icon: IconDocument,
    titel: 'Belegt statt vermutet',
    text: 'Jede benannte Umsatzbremse ist im Analyseprozess nachvollziehbar hergeleitet.',
  },
]

export function UeberUns() {
  return (
    <section
      id="ueber-uns"
      aria-labelledby="ueber-uns-headline"
      className="border-t border-shell-200 bg-shell-50 py-20 sm:py-24 lg:py-28 dark:border-night-800 dark:bg-night-900/40"
    >
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
        <SectionHeading
          label={UEBER_UNS.label}
          headline={UEBER_UNS.headline}
          text={UEBER_UNS.text}
          headlineId="ueber-uns-headline"
        />

        <Reveal delay={120} className="space-y-5 lg:pt-14">
          {PRINZIPIEN.map((prinzip) => (
            <div key={prinzip.titel} className="flex items-start gap-4">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-shell-200 bg-white text-marine-700 dark:border-night-700 dark:bg-night-900 dark:text-marine-300">
                <prinzip.icon className="size-4.5" />
              </span>
              <div>
                <h3 className="text-[0.9375rem] leading-snug">{prinzip.titel}</h3>
                <p className="mt-1.5 text-[0.875rem] leading-relaxed prose-muted">
                  {prinzip.text}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
