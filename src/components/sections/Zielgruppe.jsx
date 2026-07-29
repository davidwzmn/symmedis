import { ZIELGRUPPE } from '../../content/site.js'
import { scrollToSection } from '../../lib/scroll.js'
import { Button } from '../ui/Button.jsx'
import { IconCheck } from '../ui/Icons.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { SectionHeading } from './SectionHeading.jsx'

export function Zielgruppe() {
  return (
    <section
      id="fuer-wen"
      aria-labelledby="zielgruppe-headline"
      className="border-t border-shell-200 bg-shell-50 py-20 sm:py-24 lg:py-28 dark:border-night-800 dark:bg-night-900/40"
    >
      <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          label={ZIELGRUPPE.label}
          headline={ZIELGRUPPE.headline}
          text={ZIELGRUPPE.text}
          headlineId="zielgruppe-headline"
        />

        <Reveal delay={120} className="surface p-6 sm:p-8">
          <ul className="space-y-4">
            {ZIELGRUPPE.checkliste.map((punkt) => (
              <li key={punkt} className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-marine-800 text-white dark:bg-marine-400 dark:text-night-950"
                >
                  <IconCheck className="size-3" strokeWidth={2.4} />
                </span>
                <span className="text-[0.9375rem] leading-relaxed text-marine-950 dark:text-night-200">
                  {punkt}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 border-t border-shell-200 pt-6 dark:border-night-700">
            <p className="text-[0.875rem] leading-relaxed prose-muted">
              Mehrfach wiedererkannt? Dann klären wir im 15-Minuten-Gespräch, ob eine
              Ursachenanalyse der richtige nächste Schritt ist.
            </p>
            <Button className="mt-4" onClick={() => scrollToSection('termin')}>
              15-Minuten-Diagnosegespräch buchen
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
