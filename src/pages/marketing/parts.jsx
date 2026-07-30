import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Card } from '../../components/ui/layout.jsx'
import { BRANCHEN, TERMIN, TRUST } from '../../content/marketing.js'
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCalendar,
  IconCheck,
} from '../../components/ui/Icons.jsx'

/**
 * Optionale externe Terminbuchung. Ist VITE_BOOKING_URL gesetzt, erscheint ein
 * bewusst anzuklickender externer Button; ohne die Variable bleibt das
 * Demo-Formular aktiv – es wird keine echte Übertragung vorgetäuscht.
 */
const BOOKING_URL = import.meta.env.VITE_BOOKING_URL || ''

/** Kurzer Datenschutzhinweis statt erzwungener Checkbox. */
function DatenschutzHinweis({ children }) {
  return (
    <p className="text-xs leading-relaxed text-ink-3">
      {children}{' '}
      <Link to="/datenschutz" className="text-brand-ink underline underline-offset-2 hover:text-brand">
        Datenschutzerklärung
      </Link>
      .
    </p>
  )
}

/**
 * Wiederverwendbare Bausteine der öffentlichen Website.
 * Alle Unterseiten teilen sich denselben Seitenkopf und dieselben Abschnitte,
 * damit die Seiten als eine zusammenhängende Website lesbar bleiben.
 */

/* ------------------------------------------------------------- Seitenkopf */

/** Kopfband einer Unterseite: Eyebrow, große Überschrift, Einleitung, CTA. */
export function SeitenKopf({ eyebrow, titel, text, aktionen, kennzahlen }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-50" />
      <div className="shell-container relative py-12 lg:py-16">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-3 text-[1.875rem] leading-[1.15] font-semibold tracking-tight text-ink sm:text-[2.25rem]">
            {titel}
          </h1>
          {text ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-2">{text}</p> : null}
          {aktionen ? <div className="mt-7 flex flex-col gap-3 sm:flex-row">{aktionen}</div> : null}
        </div>

        {kennzahlen ? (
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-7 sm:grid-cols-4">
            {kennzahlen.map((k) => (
              <div key={k.text}>
                <dt className="sr-only">{k.text}</dt>
                <dd>
                  <span className="block text-xl font-semibold tracking-tight text-ink">{k.wert}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-2">{k.text}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Abschnitt */

/** Inhaltsabschnitt mit optionaler Kopfzeile – die Grundeinheit jeder Seite. */
export function Abschnitt({ eyebrow, headline, text, children, hell = false, schmal = false }) {
  return (
    <section className={cn('border-b border-line', hell ? 'bg-canvas' : 'bg-surface')}>
      <div className="shell-container py-14 lg:py-18">
        {headline || text ? (
          <div className={cn('mb-9', schmal ? 'max-w-2xl' : 'max-w-3xl')}>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2 className="mt-2.5 text-[1.5rem] font-semibold tracking-tight text-ink sm:text-[1.75rem]">
              {headline}
            </h2>
            {text ? <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">{text}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  )
}

/* ------------------------------------------------------- Vertrauensleiste */

export function Vertrauensleiste() {
  return (
    <section aria-label="Kennzahlen der Ursachenanalyse" className="border-b border-line bg-canvas">
      <div className="shell-container py-8">
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {TRUST.map((eintrag) => (
            <div key={eintrag.text}>
              <dt className="sr-only">{eintrag.text}</dt>
              <dd>
                <span className="block text-lg font-semibold tracking-tight text-ink">
                  {eintrag.wert}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-ink-2">{eintrag.text}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-7 border-t border-line pt-5">
          <p className="text-xs font-medium text-ink-3">Spezialisiert auf</p>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {BRANCHEN.map((branche) => (
              <li key={branche}>
                <Chip toneName="neutral">{branche}</Chip>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- CTA-Band */

/** Abschließender Aufruf am Seitenende – dunkle Fläche, klarer nächster Schritt. */
export function CtaBand({
  titel = 'Herausfinden, was Ihr Wachstum wirklich bremst',
  text = 'Beginnen Sie mit einem 15-minütigen Diagnosegespräch – oder sehen Sie sich zuerst die Plattform an.',
  primaer = { to: '/termin', label: '15-Minuten-Gespräch anfragen' },
  sekundaer = { to: '/demo', label: 'Plattform ansehen' },
}) {
  return (
    <section className="bg-surface">
      <div className="shell-container py-14 lg:py-18">
        <div className="rounded-2xl bg-surface-inverse px-6 py-10 sm:px-10 sm:py-12">
          <div className="max-w-2xl">
            <h2 className="text-[1.375rem] font-semibold tracking-tight text-canvas sm:text-[1.625rem]">
              {titel}
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-canvas/80">{text}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to={primaer.to} variant="on-dark" size="lg">
                {primaer.label}
                <IconArrowRight className="size-4" />
              </Button>
              {sekundaer ? (
                <Button
                  as={Link}
                  to={sekundaer.to}
                  size="lg"
                  className="border border-canvas/25 bg-transparent text-canvas hover:bg-canvas/10"
                >
                  {sekundaer.label}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ Terminformular */

/** Ablauf-Karte und Anfrageformular – auf der Terminseite und als Baustein. */
export function TerminFormular() {
  const [gesendet, setGesendet] = useState(false)
  const [form, setForm] = useState({ name: '', unternehmen: '', email: '', situation: '' })
  const setzen = (feld) => (event) => setForm((alt) => ({ ...alt, [feld]: event.target.value }))

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2.5 text-[0.9375rem] font-semibold text-ink">
          <IconCalendar className="size-4 text-brand-ink" />
          Ablauf des Gesprächs
        </h2>
        <ol className="mt-4 space-y-3">
          {TERMIN.ablauf.map((schritt, index) => (
            <li key={schritt} className="flex items-start gap-3">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-ink">
                {index + 1}
              </span>
              <span className="text-[0.8125rem] leading-relaxed text-ink-2">{schritt}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-3">
          15 Minuten, per Videokonferenz. Keine Präsentation, keine Verkaufsrunde.
        </p>
      </Card>

      {BOOKING_URL ? (
        <Card className="flex flex-col p-5 sm:p-6">
          <h2 className="text-[0.9375rem] font-semibold text-ink">Direkt einen Termin wählen</h2>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">
            Sie wählen im nächsten Schritt selbst einen freien Zeitpunkt für ein 15-minütiges
            Diagnosegespräch. Der Buchungsdienst öffnet sich in einem neuen Tab.
          </p>
          <Button
            as="a"
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="cta"
            size="lg"
            className="mt-5 self-start"
          >
            <IconCalendar className="size-4" />
            15-Minuten-Gespräch buchen
            <IconArrowUpRight className="size-4" />
          </Button>
          <div className="mt-5 border-t border-line pt-4">
            <DatenschutzHinweis>
              Beim externen Buchungsdienst gelten dessen Datenschutzinformationen. Hinweise zu Ihren
              Daten bei uns finden Sie in unserer
            </DatenschutzHinweis>
          </div>
        </Card>
      ) : (
      <Card className="p-5 sm:p-6">
        {gesendet ? (
          <div className="py-6 text-center">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-ok-soft text-ok-ink">
              <IconCheck className="size-5" />
            </span>
            <h2 className="mt-4 text-[0.9375rem] font-semibold text-ink">Anfrage vorgemerkt</h2>
            <p className="mx-auto mt-2 max-w-sm text-[0.8125rem] leading-relaxed text-ink-2">
              Dies ist eine Demo – es wurde nichts versendet und nichts gespeichert. In der echten
              Anwendung würde sich das SYMMEDIS-Team innerhalb eines Werktags melden.
            </p>
            <Button variant="secondary" size="sm" className="mt-5" onClick={() => setGesendet(false)}>
              Formular zurücksetzen
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              setGesendet(true)
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Feld label="Name" value={form.name} onChange={setzen('name')} autoComplete="name" required />
              <Feld
                label="Unternehmen"
                value={form.unternehmen}
                onChange={setzen('unternehmen')}
                autoComplete="organization"
                required
              />
            </div>
            <Feld
              label="E-Mail"
              type="email"
              value={form.email}
              onChange={setzen('email')}
              autoComplete="email"
              required
            />
            <div>
              <label htmlFor="situation" className="mb-1.5 block text-[0.8125rem] font-medium text-ink">
                Was bremst aus Ihrer Sicht gerade?
                <span className="ml-1.5 text-xs font-normal text-ink-3">optional</span>
              </label>
              <textarea
                id="situation"
                rows={4}
                value={form.situation}
                onChange={setzen('situation')}
                placeholder="Zwei, drei Sätze genügen."
                className="w-full resize-y rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-3/80 hover:border-line-strong focus:border-brand focus:outline-none"
              />
            </div>

            <Button type="submit" size="lg" fullWidth>
              Diagnosegespräch anfragen
            </Button>

            <p className="text-xs leading-relaxed text-ink-3">
              Demo-Formular: Es werden keine Daten übertragen oder gespeichert. Bitte keine
              Patienten- oder Gesundheitsdaten eingeben.
            </p>
            <DatenschutzHinweis>
              Wie wir geschäftliche Anfragen verarbeiten, erklären wir in unserer
            </DatenschutzHinweis>
          </form>
        )}
      </Card>
      )}
    </div>
  )
}

function Feld({ label, value, onChange, type = 'text', required, autoComplete }) {
  const id = `feld-${label.toLowerCase().replace(/[^a-z]/g, '')}`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.8125rem] font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-0.5 text-urgent-ink" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className="h-9.5 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-3/80 focus:border-brand focus:outline-none"
      />
    </div>
  )
}
