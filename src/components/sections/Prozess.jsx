import { PROZESS } from '../../content/site.js'
import { Button } from '../ui/Button.jsx'
import { IconArrowRight } from '../ui/Icons.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { SectionHeading } from './SectionHeading.jsx'

export function Prozess({ onOpenDemo }) {
  return (
    <section
      id="ursachenanalyse"
      aria-labelledby="prozess-headline"
      className="py-20 sm:py-24 lg:py-28"
    >
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            label={PROZESS.label}
            headline={PROZESS.headline}
            text={PROZESS.text}
            headlineId="prozess-headline"
          />
          <Reveal delay={160} className="shrink-0">
            <Button variant="secondary" onClick={onOpenDemo}>
              Demo der Ursachenanalyse ansehen
              <IconArrowRight className="size-4" />
            </Button>
          </Reveal>
        </div>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-sm border border-shell-200 bg-shell-200 lg:mt-16 lg:grid-cols-2 dark:border-night-700 dark:bg-night-700">
          {PROZESS.schritte.map((schritt, index) => (
            <Reveal
              as="li"
              key={schritt.nummer}
              delay={index * 70}
              className="flex gap-5 bg-white p-6 sm:p-8 dark:bg-night-950"
            >
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-marine-200 font-serif text-sm text-marine-800 dark:border-marine-700 dark:text-marine-300"
              >
                {schritt.nummer}
              </span>
              <div className="min-w-0">
                <h3 className="text-[1.0625rem] leading-snug">
                  <span className="sr-only">Schritt {schritt.nummer}: </span>
                  {schritt.titel}
                </h3>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed prose-muted">
                  {schritt.text}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
