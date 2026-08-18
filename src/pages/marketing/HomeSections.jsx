import { useState } from 'react'
import { Card } from '../../components/ui/layout.jsx'
import { initialen } from '../../lib/format.js'
import { ZIELGRUPPE, TEAM } from '../../content/marketing.js'
import alfredPortrait from '../../assets/marketing/alfred.webp?inline'
import davidPortrait from '../../assets/marketing/david.webp?inline'
import { IconArrowUpRight, IconCheck, IconClose } from '../../components/ui/Icons.jsx'

/* ------------------------------------------------------------- Zielgruppe */

/** „Für wen?“ – geeignet vs. weniger passend, ruhig und respektvoll. */
export function ZielgruppeSection() {
  return (
    <section className="border-b border-line bg-canvas">
      <div className="shell-container py-14 lg:py-18">
        <div className="max-w-3xl">
          <p className="eyebrow">{ZIELGRUPPE.label}</p>
          <h2 className="mt-2.5 text-[1.5rem] font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            {ZIELGRUPPE.headline}
          </h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">{ZIELGRUPPE.text}</p>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-2">
          <Card className="p-5 sm:p-6">
            <h3 className="text-[0.9375rem] font-semibold text-ink">Passt, wenn …</h3>
            <ul className="mt-4 space-y-2.5">
              {ZIELGRUPPE.geeignet.map((punkt) => (
                <li key={punkt} className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-ink-2">
                  <IconCheck className="mt-0.5 size-4 shrink-0 text-accent-ink" />
                  {punkt}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-surface-muted p-5 sm:p-6">
            <h3 className="text-[0.9375rem] font-semibold text-ink">Weniger passend, wenn …</h3>
            <ul className="mt-4 space-y-2.5">
              {ZIELGRUPPE.wenigerPassend.map((punkt) => (
                <li key={punkt} className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-ink-3">
                  <IconClose className="mt-0.5 size-4 shrink-0 text-ink-3" />
                  {punkt}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------- Team & Vertrauen */

const PORTRAITS = {
  'Alfred Michael Waizmann': alfredPortrait,
  'David Constantin Waizmann': davidPortrait,
}

/** Porträt: direkt in den Build eingebettet, mit Initialen als sauberem Fallback. */
function Portrait({ person }) {
  const [bildFehlt, setBildFehlt] = useState(false)
  const src = PORTRAITS[person.name] || null

  if (src && !bildFehlt) {
    return (
      <img
        src={src}
        alt={person.alt}
        width={640}
        height={640}
        loading="lazy"
        data-team-portrait={person.name}
        onError={() => setBildFehlt(true)}
        className="aspect-square w-full rounded-2xl object-cover [object-position:50%_20%]"
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex aspect-square w-full items-center justify-center rounded-2xl bg-brand text-4xl font-semibold text-on-brand sm:text-5xl"
    >
      {initialen(person.name)}
    </span>
  )
}

function PersonCard({ person }) {
  return (
    <Card className="grid overflow-hidden p-0 sm:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
      <div className="bg-surface-muted p-4 sm:p-5">
        <Portrait person={person} />
      </div>
      <div className="flex flex-col p-5 sm:p-6">
        <div>
          <h3 className="text-[1.05rem] font-semibold text-ink">{person.name}</h3>
          <p className="mt-1 text-[0.8125rem] font-medium text-brand-ink">{person.rolle}</p>
        </div>
        <p className="mt-4 flex-1 text-[0.875rem] leading-relaxed text-ink-2">{person.text}</p>
        <a
          href={person.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`LinkedIn-Profil von ${person.name} (öffnet in neuem Tab)`}
          className="mt-5 inline-flex items-center gap-1.5 self-start rounded-lg border border-line-strong px-3 py-1.5 text-[0.8125rem] font-medium text-ink transition-colors hover:border-brand hover:text-brand-ink"
        >
          LinkedIn-Profil
          <IconArrowUpRight className="size-4" />
        </a>
      </div>
    </Card>
  )
}

export function TeamSection() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="shell-container py-16 lg:py-22">
        <div className="max-w-3xl">
          <p className="eyebrow">TEAM & VERTRAUEN</p>
          <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.55rem]">
            Die Menschen hinter SYMMEDIS
          </h2>
          <p className="mt-4 text-[0.95rem] leading-7 text-ink-2">
            Strategische Erfahrung im Gesundheitsmarkt trifft auf digitale Produktentwicklung, Software und KI. Die Analyse wird durch Technologie strukturiert – die Verantwortung für Bewertung, Priorisierung und Freigabe bleibt bei uns.
          </p>
        </div>

        <div className="mt-10 grid gap-5 xl:grid-cols-2">
          {TEAM.personen.map((person) => (
            <PersonCard key={person.name} person={person} />
          ))}
        </div>

        <p className="mt-7 text-[0.9375rem] font-medium text-ink">{TEAM.positionierung}</p>
      </div>
    </section>
  )
}