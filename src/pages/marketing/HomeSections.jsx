import { Card } from '../../components/ui/layout.jsx'
import { initialen } from '../../lib/format.js'
import { ZIELGRUPPE, TEAM } from '../../content/marketing.js'
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

/** Porträt: Bild, falls vorhanden – sonst gestalteter Initialen-Platzhalter. */
function Portrait({ person }) {
  if (person.bild) {
    return (
      <img
        src={person.bild}
        alt={person.alt}
        width={112}
        height={112}
        loading="lazy"
        className="size-16 shrink-0 rounded-2xl object-cover [object-position:50%_20%] sm:size-20"
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand text-lg font-semibold text-on-brand sm:size-20 sm:text-xl"
    >
      {initialen(person.name)}
    </span>
  )
}

function PersonCard({ person }) {
  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Portrait person={person} />
        <div className="min-w-0">
          <h3 className="text-[1rem] font-semibold text-ink">{person.name}</h3>
          <p className="mt-0.5 text-[0.8125rem] font-medium text-brand-ink">{person.rolle}</p>
        </div>
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
    </Card>
  )
}

export function TeamSection() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="shell-container py-14 lg:py-18">
        <div className="max-w-3xl">
          <p className="eyebrow">{TEAM.label}</p>
          <h2 className="mt-2.5 text-[1.5rem] font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            {TEAM.headline}
          </h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">{TEAM.einleitung}</p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {TEAM.personen.map((person) => (
            <PersonCard key={person.name} person={person} />
          ))}
        </div>

        <p className="mt-7 text-[0.9375rem] font-medium text-ink">{TEAM.positionierung}</p>
      </div>
    </section>
  )
}
