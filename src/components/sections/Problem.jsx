import { PROBLEM } from '../../content/site.js'
import { IconCompare, IconPulse, IconSpeech, IconTarget } from '../ui/Icons.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { SectionHeading } from './SectionHeading.jsx'

const ICONS = {
  target: IconTarget,
  speech: IconSpeech,
  compare: IconCompare,
  pulse: IconPulse,
}

export function Problem() {
  return (
    <section
      id="problem"
      aria-labelledby="problem-headline"
      className="border-t border-shell-200 bg-shell-50 py-20 sm:py-24 lg:py-28 dark:border-night-800 dark:bg-night-900/40"
    >
      <div className="container-page">
        <SectionHeading
          label={PROBLEM.label}
          headline={PROBLEM.headline}
          text={PROBLEM.text}
          headlineId="problem-headline"
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {PROBLEM.karten.map((karte, index) => {
            const Icon = ICONS[karte.icon] ?? IconTarget
            return (
              <Reveal
                as="li"
                key={karte.titel}
                delay={index * 70}
                className="surface flex h-full flex-col p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-marine-300 dark:hover:border-marine-600"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-sm border border-shell-200 bg-shell-50 text-marine-700 dark:border-night-700 dark:bg-night-800 dark:text-marine-300">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-[1.0625rem] leading-snug">{karte.titel}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed prose-muted">{karte.text}</p>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
