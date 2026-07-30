import { Fragment } from 'react'
import { SeitenKopf } from './parts.jsx'

/**
 * Rendert ein verbindliches Rechtsdokument (Impressum, AGB, Datenschutz) aus
 * dem strukturierten Blockmodell in content/legal.js. Der Inhalt wird nicht
 * verändert; hier entsteht nur die typografische Darstellung – lesbare
 * Schriftgrößen, klare Überschriftenhierarchie, druckfreundliches Layout.
 */

const EMAIL = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi

/** E-Mail-Adressen im Fließtext klickbar machen, sonst Text unverändert lassen. */
function mitEmailLinks(text) {
  const teile = text.split(EMAIL)
  return teile.map((teil, i) =>
    EMAIL.test(teil) ? (
      <a
        key={i}
        href={`mailto:${teil}`}
        className="text-brand-ink underline decoration-brand-border underline-offset-2 hover:decoration-brand"
      >
        {teil}
      </a>
    ) : (
      <Fragment key={i}>{teil}</Fragment>
    ),
  )
}

function Block({ block }) {
  switch (block.t) {
    case 'h2':
      return (
        <h2 className="mt-9 text-[1.125rem] font-semibold tracking-tight text-ink first:mt-0">
          {block.text}
        </h2>
      )
    case 'h3':
      return <h3 className="mt-7 text-[0.9375rem] font-semibold text-ink">{block.text}</h3>
    case 'p':
      return (
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">{mitEmailLinks(block.text)}</p>
      )
    case 'lines':
      return (
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">
          {block.items.map((zeile, i) => (
            <Fragment key={zeile}>
              {i > 0 ? <br /> : null}
              {mitEmailLinks(zeile)}
            </Fragment>
          ))}
        </p>
      )
    case 'ol':
      return (
        <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-[0.9375rem] leading-relaxed text-ink-2 marker:text-ink-3 marker:font-medium">
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              {mitEmailLinks(item)}
            </li>
          ))}
        </ol>
      )
    case 'ul':
      return (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.9375rem] leading-relaxed text-ink-2 marker:text-ink-3">
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              {mitEmailLinks(item)}
            </li>
          ))}
        </ul>
      )
    default:
      return null
  }
}

export function LegalPage({ dokument }) {
  return (
    <>
      <SeitenKopf eyebrow="Rechtliches" titel={dokument.titel} text={dokument.stand} />

      <section className="bg-canvas">
        <div className="shell-container py-12 lg:py-16">
          <article className="mx-auto max-w-3xl">
            {dokument.hinweis ? (
              <p className="mb-8 rounded-card border border-brand-border bg-brand-softer px-4 py-3.5 text-[0.875rem] leading-relaxed text-ink">
                {dokument.hinweis}
              </p>
            ) : null}

            {dokument.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}

            <p className="mt-10 border-t border-line pt-5 text-[0.8125rem] text-ink-3">
              {dokument.stand}
            </p>
          </article>
        </div>
      </section>
    </>
  )
}
