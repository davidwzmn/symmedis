import { useState } from 'react'
import { cn } from '../../lib/cn.js'
import { SeitenKopf, Abschnitt, CtaBand } from './parts.jsx'
import { FAQ } from '../../content/marketing.js'
import { IconChevronDown } from '../../components/ui/Icons.jsx'

export function FaqPage() {
  const [offen, setOffen] = useState(0)

  return (
    <>
      <SeitenKopf
        eyebrow="Häufige Fragen"
        titel="Was Unternehmen vor der Analyse wissen wollen"
        text="Von der Dauer über die Datentrennung bis zur Frage, für wen SYMMEDIS nicht geeignet ist – die Antworten offen und ohne Verkaufston."
      />

      <Abschnitt hell>
        <div className="max-w-3xl">
          <ul className="divide-y divide-line rounded-card border border-line bg-surface">
            {FAQ.map((eintrag, index) => {
              const aktiv = offen === index
              return (
                <li key={eintrag.frage}>
                  <h2>
                    <button
                      type="button"
                      onClick={() => setOffen(aktiv ? -1 : index)}
                      aria-expanded={aktiv}
                      aria-controls={`faq-${index}`}
                      className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-muted sm:px-5"
                    >
                      <span className="text-[0.9375rem] font-medium text-ink">{eintrag.frage}</span>
                      <IconChevronDown
                        className={cn(
                          'mt-0.5 size-4 shrink-0 text-ink-3 transition-transform duration-200',
                          aktiv && 'rotate-180',
                        )}
                      />
                    </button>
                  </h2>
                  {aktiv ? (
                    <div id={`faq-${index}`} className="px-4 pb-4 sm:px-5">
                      <p className="max-w-2xl text-[0.875rem] leading-relaxed text-ink-2">
                        {eintrag.antwort}
                      </p>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      </Abschnitt>

      <CtaBand
        titel="Frage nicht dabei?"
        text="Stellen Sie sie im 15-Minuten-Gespräch. Wir antworten offen – auch, wenn eine Analyse in Ihrem Fall nicht das Richtige ist."
        sekundaer={{ to: '/plattform', label: 'Plattform ansehen' }}
      />
    </>
  )
}
