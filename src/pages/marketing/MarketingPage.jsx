import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn.js'
import { KATEGORIEN } from '../../data/catalog.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useTheme } from '../../hooks/useTheme.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader } from '../../components/ui/layout.jsx'
import { Modal } from '../../components/ui/overlays.jsx'
import { Logo } from '../../components/brand/Logo.jsx'
import { HeroDashboard } from './HeroDashboard.jsx'
import {
  ANALYSEBEREICHE,
  ANGEBOT,
  BRANCHEN,
  FAQ,
  FOOTER,
  FUNKTIONSWEISE,
  HERO,
  KUNDENPORTAL,
  MITARBEITERPORTAL,
  NAV,
  PLAN,
  PLATTFORM,
  PROBLEM,
  RECHTSTEXTE,
  SOCIAL,
  TERMIN,
  TRUST,
  UEBER_UNS,
} from '../../content/marketing.js'
import {
  IconAlert,
  IconArrowRight,
  IconCalendar,
  IconChart,
  IconCheck,
  IconChevronDown,
  IconClose,
  IconLock,
  IconMenu,
  IconMoon,
  IconRoute,
  IconShare,
  IconShield,
  IconSun,
  IconTarget,
  IconUsers,
} from '../../components/ui/Icons.jsx'

/** Öffentliche Website: Positionierung, Produkt, Ablauf, Angebot. */
export function MarketingPage() {
  const { getKunde } = useWorkspace()
  const [rechtstext, setRechtstext] = useState(null)
  const kunde = getKunde('nordvita')

  return (
    <div className="min-h-dvh bg-surface">
      <a
        href="#hauptinhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-brand"
      >
        Zum Inhalt springen
      </a>

      <Kopfzeile />

      <main id="hauptinhalt">
        <Hero kunde={kunde} />
        <Vertrauensleiste />
        <Problem />
        <Analysebereiche />
        <Funktionsweise />
        <Plattformvorschau />
        <Portale />
        <SocialAbschnitt />
        <PlanAbschnitt />
        <Angebot />
        <UeberUns />
        <Faq />
        <Terminbuchung />
      </main>

      <Fusszeile onRecht={setRechtstext} />

      <Modal
        open={Boolean(rechtstext)}
        onClose={() => setRechtstext(null)}
        title={rechtstext ? RECHTSTEXTE[rechtstext].titel : ''}
        size="md"
      >
        <div className="space-y-4 px-5 py-5">
          {rechtstext
            ? RECHTSTEXTE[rechtstext].absaetze.map((absatz) => (
                <p key={absatz} className="text-[0.875rem] leading-relaxed text-ink-2">
                  {absatz}
                </p>
              ))
            : null}
        </div>
      </Modal>
    </div>
  )
}

/* ---------------------------------------------------------------- Kopfzeile */

function Kopfzeile() {
  const { theme, toggleTheme } = useTheme()
  const [offen, setOffen] = useState(false)

  useEffect(() => {
    if (!offen) return undefined
    const onKey = (event) => event.key === 'Escape' && setOffen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [offen])

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur">
      <div className="shell-container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="rounded-lg">
          <Logo bereich="Diagnosis OS" />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((eintrag) => (
              <li key={eintrag.id}>
                <a
                  href={`#${eintrag.id}`}
                  className="rounded-lg px-3 py-2 text-[0.8125rem] font-medium text-ink-2 transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  {eintrag.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
            aria-pressed={theme === 'dark'}
            className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-muted hover:text-ink"
          >
            {theme === 'dark' ? <IconSun className="size-[1.125rem]" /> : <IconMoon className="size-[1.125rem]" />}
          </button>

          <span className="hidden sm:inline-flex">
            <Button as={Link} to="/login" variant="ghost" size="sm">
              Anmelden
            </Button>
          </span>
          <span className="hidden sm:inline-flex">
            <Button as={Link} to="/demo" size="sm">
              Plattform ansehen
            </Button>
          </span>

          <button
            type="button"
            onClick={() => setOffen((o) => !o)}
            aria-expanded={offen}
            aria-label={offen ? 'Menü schließen' : 'Menü öffnen'}
            className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-muted lg:hidden"
          >
            {offen ? <IconClose className="size-5" /> : <IconMenu className="size-5" />}
          </button>
        </div>
      </div>

      {offen ? (
        <div className="border-t border-line bg-surface lg:hidden">
          <nav aria-label="Hauptnavigation (mobil)" className="shell-container py-3">
            <ul className="space-y-0.5">
              {NAV.map((eintrag) => (
                <li key={eintrag.id}>
                  <a
                    href={`#${eintrag.id}`}
                    onClick={() => setOffen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-surface-muted hover:text-ink"
                  >
                    {eintrag.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid gap-2 border-t border-line pt-3">
              <Button as={Link} to="/demo" fullWidth onClick={() => setOffen(false)}>
                Plattform ansehen
              </Button>
              <Button as={Link} to="/login" variant="secondary" fullWidth onClick={() => setOffen(false)}>
                Anmelden
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}

/* -------------------------------------------------------------------- Hero */

function Hero({ kunde }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-60" />
      <div className="shell-container relative py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <Chip toneName="brand" icon={IconShield}>
              {HERO.badge}
            </Chip>

            <h1 className="mt-5 text-[1.875rem] leading-[1.15] font-semibold tracking-tight text-ink sm:text-[2.375rem] lg:text-[2.75rem]">
              {HERO.headline}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-2">{HERO.text}</p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button as="a" href="#termin" size="lg">
                {HERO.ctaPrimary}
              </Button>
              <Button as={Link} to="/demo" variant="secondary" size="lg">
                {HERO.ctaSecondary}
                <IconArrowRight className="size-4" />
              </Button>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
              {['10–14 Tage bis zum Ergebnis', 'Menschlich geprüft', '90-Tage-Plan inklusive'].map(
                (punkt) => (
                  <li key={punkt} className="flex items-center gap-1.5 text-[0.8125rem] text-ink-2">
                    <IconCheck className="size-4 shrink-0 text-accent-ink" />
                    {punkt}
                  </li>
                ),
              )}
            </ul>
          </div>

          {kunde ? <HeroDashboard kunde={kunde} /> : null}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------- Vertrauensleiste */

function Vertrauensleiste() {
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

/* ---------------------------------------------------------------- Bausteine */

function Abschnitt({ id, label, headline, text, children, hell = false, className }) {
  return (
    <section id={id} className={cn('border-b border-line', hell ? 'bg-canvas' : 'bg-surface', className)}>
      <div className="shell-container py-14 lg:py-18">
        <div className="max-w-2xl">
          {label ? <p className="eyebrow">{label}</p> : null}
          <h2 className="mt-2.5 text-[1.5rem] font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            {headline}
          </h2>
          {text ? <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-2">{text}</p> : null}
        </div>
        <div className="mt-9">{children}</div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- Problem */

function Problem() {
  return (
    <Abschnitt id="problem" label={PROBLEM.label} headline={PROBLEM.headline} text={PROBLEM.text} hell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PROBLEM.karten.map((karte, index) => (
          <Card key={karte.titel} className="flex flex-col p-5">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-surface-inverse text-xs font-semibold text-canvas">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-3.5 text-[0.9375rem] font-semibold text-ink">{karte.titel}</h3>
            <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-ink-2">{karte.text}</p>
            <p className="mt-3 border-t border-line pt-3 text-xs leading-snug text-ink-3">
              {karte.symptom}
            </p>
          </Card>
        ))}
      </div>
    </Abschnitt>
  )
}

/* ---------------------------------------------------------- Analysebereiche */

function Analysebereiche() {
  const gruppen = ['Strategie', 'Kommunikation', 'Markt']

  return (
    <Abschnitt
      id="analysebereiche"
      label={ANALYSEBEREICHE.label}
      headline={ANALYSEBEREICHE.headline}
      text={ANALYSEBEREICHE.text}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {gruppen.map((gruppe) => (
          <Card key={gruppe}>
            <CardHeader
              title={gruppe}
              subtitle={`${KATEGORIEN.filter((k) => k.gruppe === gruppe).length} Bereiche`}
              icon={gruppe === 'Strategie' ? IconTarget : gruppe === 'Markt' ? IconChart : IconShare}
            />
            <CardBody className="px-0 py-0">
              <ul className="divide-y divide-line">
                {KATEGORIEN.filter((k) => k.gruppe === gruppe).map((kategorie) => (
                  <li key={kategorie.id} className="px-4 py-3.5 sm:px-5">
                    <p className="text-[0.875rem] font-medium text-ink">{kategorie.label}</p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-2">
                      {kategorie.frage}
                    </p>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ))}
      </div>

      <p className="mt-6 max-w-3xl text-[0.8125rem] leading-relaxed text-ink-3">
        Je Bereich entstehen Reifegrad, Beobachtung, Ursache, Auswirkung, Empfehlung, Beleg und
        Priorität. Erst die Zusammenschau ergibt die drei größten Umsatzbremsen.
      </p>
    </Abschnitt>
  )
}

/* ----------------------------------------------------------- Funktionsweise */

function Funktionsweise() {
  return (
    <Abschnitt
      id="funktionsweise"
      label={FUNKTIONSWEISE.label}
      headline={FUNKTIONSWEISE.headline}
      text={FUNKTIONSWEISE.text}
      hell
    >
      <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {FUNKTIONSWEISE.schritte.map((schritt) => (
          <li key={schritt.nummer}>
            <Card className="flex h-full flex-col p-5">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand text-xs font-semibold text-on-brand">
                {schritt.nummer}
              </span>
              <h3 className="mt-3.5 text-[0.9375rem] font-semibold text-ink">{schritt.titel}</h3>
              <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-ink-2">
                {schritt.text}
              </p>
              <div className="mt-3.5 border-t border-line pt-3.5">
                <Chip size="sm" toneName={schritt.traeger.startsWith('Team') ? 'accent' : 'neutral'}>
                  {schritt.traeger}
                </Chip>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <Card className="mt-6 border-brand-border bg-brand-softer p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
            <IconShield className="size-5" />
          </span>
          <div>
            <h3 className="text-[0.9375rem] font-semibold text-ink">
              Software strukturiert, Menschen entscheiden
            </h3>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-2">
              Jeder Bewertungsvorschlag durchläuft fünf Stufen – automatisch vorgeschlagen, in
              Prüfung, bearbeitet, intern freigegeben, für Kunden freigegeben. Nichts wird
              automatisch veröffentlicht oder versendet.
            </p>
          </div>
        </div>
      </Card>
    </Abschnitt>
  )
}

/* ------------------------------------------------------- Plattformvorschau */

function Plattformvorschau() {
  return (
    <Abschnitt id="plattform" label={PLATTFORM.label} headline={PLATTFORM.headline} text={PLATTFORM.text}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PLATTFORM.module.map((modul) => (
          <Card key={modul.titel} className="p-5">
            <h3 className="text-[0.9375rem] font-semibold text-ink">{modul.titel}</h3>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{modul.text}</p>
          </Card>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button as={Link} to="/demo">
          Interaktive Produktdemo öffnen
          <IconArrowRight className="size-4" />
        </Button>
        <Button as={Link} to="/login" variant="secondary">
          Portalzugang testen
        </Button>
      </div>
    </Abschnitt>
  )
}

/* ---------------------------------------------------------------- Portale */

function Portale() {
  const bloecke = [
    { daten: KUNDENPORTAL, icon: IconUsers, ton: 'brand', ziel: '/login?rolle=kunde', cta: 'Kundenportal ansehen' },
    { daten: MITARBEITERPORTAL, icon: IconLock, ton: 'accent', ziel: '/login?rolle=intern', cta: 'Mitarbeiterportal ansehen' },
  ]

  return (
    <section id="portale" className="border-b border-line bg-canvas">
      <div className="shell-container py-14 lg:py-18">
        <div className="grid gap-6 lg:grid-cols-2">
          {bloecke.map(({ daten, icon: Icon, ton, ziel, cta }) => (
            <Card key={daten.label} className="flex flex-col p-6 sm:p-7">
              <span
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-xl',
                  ton === 'brand' ? 'bg-brand-soft text-brand-ink' : 'bg-accent-soft text-accent-ink',
                )}
              >
                <Icon className="size-5" />
              </span>
              <p className="eyebrow mt-4">{daten.label}</p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">
                {daten.headline}
              </h2>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-2">{daten.text}</p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {daten.punkte.map((punkt) => (
                  <li key={punkt} className="flex items-start gap-2.5 text-[0.8125rem] text-ink">
                    <IconCheck
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        ton === 'brand' ? 'text-brand-ink' : 'text-accent-ink',
                      )}
                    />
                    {punkt}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Button as={Link} to={ziel} variant="secondary" size="sm">
                  {cta}
                  <IconArrowRight className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-warn-border p-5">
          <div className="flex items-start gap-3">
            <IconAlert className="mt-0.5 size-5 shrink-0 text-warn-ink" />
            <p className="text-[0.875rem] leading-relaxed text-ink-2">
              <span className="font-semibold text-ink">Strikte Trennung: </span>
              Interne Notizen, Entwürfe und Bewertungen im Zwischenstand erscheinen nie im
              Kundenportal – auch nicht in Exporten. Jedes Projekt ist ein eigener Mandant.
            </p>
          </div>
        </Card>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Social */

function SocialAbschnitt() {
  return (
    <Abschnitt id="social" label={SOCIAL.label} headline={SOCIAL.headline} text={SOCIAL.text}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SOCIAL.kriterien.map((kriterium, index) => (
          <Card key={kriterium.titel} className="p-5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                <IconShare className="size-4" />
              </span>
              <span className="tabular text-xs font-semibold text-ink-3">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="mt-3.5 text-[0.9375rem] font-semibold text-ink">{kriterium.titel}</h3>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{kriterium.text}</p>
          </Card>
        ))}
      </div>

      <p className="mt-6 max-w-3xl text-[0.8125rem] leading-relaxed text-ink-3">
        Ausgewertet werden öffentlich sichtbare Beiträge der letzten 90 Tage. Für eine laufende
        Auswertung lassen sich Kanäle über vorbereitete Connector-Schnittstellen anbinden.
      </p>
    </Abschnitt>
  )
}

/* -------------------------------------------------------------------- Plan */

function PlanAbschnitt() {
  return (
    <Abschnitt id="plan" label={PLAN.label} headline={PLAN.headline} text={PLAN.text} hell>
      <ol className="grid gap-4 lg:grid-cols-3">
        {PLAN.phasen.map((phase, index) => (
          <li key={phase.label}>
            <Card className="flex h-full flex-col p-5">
              <div className="flex items-center justify-between gap-3">
                <Chip toneName="brand" icon={IconRoute}>
                  {phase.label}
                </Chip>
                <span className="tabular text-xs font-semibold text-ink-3">
                  Phase {index + 1}/3
                </span>
              </div>
              <h3 className="mt-3.5 text-[0.9375rem] font-semibold text-ink">{phase.ziel}</h3>
              <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-ink-2">{phase.text}</p>
            </Card>
          </li>
        ))}
      </ol>
    </Abschnitt>
  )
}

/* ----------------------------------------------------------------- Angebot */

function Angebot() {
  return (
    <Abschnitt id="angebot" label={ANGEBOT.label} headline={ANGEBOT.headline} text={ANGEBOT.text}>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Leistungsumfang" subtitle="Enthalten in jeder Ursachenanalyse" />
          <CardBody className="px-0 py-0">
            <ul className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
              {ANGEBOT.leistungen.map((leistung) => (
                <li
                  key={leistung}
                  className="flex items-start gap-2.5 px-4 py-3 text-[0.875rem] text-ink sm:px-5"
                >
                  <IconCheck className="mt-0.5 size-4 shrink-0 text-ok-ink" />
                  {leistung}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Eckdaten" />
            <CardBody>
              <dl className="space-y-3.5">
                {ANGEBOT.fakten.map((fakt) => (
                  <div key={fakt.label} className="flex items-baseline justify-between gap-3">
                    <dt className="text-[0.8125rem] text-ink-2">{fakt.label}</dt>
                    <dd className="text-[0.875rem] font-semibold text-ink">{fakt.wert}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card className="bg-surface-inverse p-5">
            <h3 className="text-[0.9375rem] font-semibold text-canvas">
              Erst prüfen, dann entscheiden
            </h3>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-canvas/80">
              Im 15-Minuten-Gespräch klären wir, ob eine Ursachenanalyse in Ihrer Situation
              überhaupt sinnvoll ist. Wenn nicht, sagen wir das.
            </p>
            <Button as="a" href="#termin" variant="on-dark" size="sm" className="mt-4">
              Gespräch vereinbaren
            </Button>
          </Card>
        </div>
      </div>
    </Abschnitt>
  )
}

/* ---------------------------------------------------------------- Über uns */

function UeberUns() {
  return (
    <Abschnitt id="ueber-uns" label={UEBER_UNS.label} headline={UEBER_UNS.headline} text={UEBER_UNS.text} hell>
      <div className="grid gap-4 md:grid-cols-3">
        {UEBER_UNS.prinzipien.map((prinzip) => (
          <Card key={prinzip.titel} className="p-5">
            <h3 className="text-[0.9375rem] font-semibold text-ink">{prinzip.titel}</h3>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{prinzip.text}</p>
          </Card>
        ))}
      </div>
    </Abschnitt>
  )
}

/* --------------------------------------------------------------------- FAQ */

function Faq() {
  const [offen, setOffen] = useState(0)

  return (
    <Abschnitt
      id="faq"
      label="HÄUFIGE FRAGEN"
      headline="Was Unternehmen vor der Analyse wissen wollen"
    >
      <div className="max-w-3xl">
        <ul className="divide-y divide-line rounded-card border border-line bg-surface">
          {FAQ.map((eintrag, index) => {
            const aktiv = offen === index
            return (
              <li key={eintrag.frage}>
                <h3>
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
                </h3>
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
  )
}

/* ------------------------------------------------------------ Terminbuchung */

function Terminbuchung() {
  const [gesendet, setGesendet] = useState(false)
  const [form, setForm] = useState({ name: '', unternehmen: '', email: '', situation: '' })

  const setzen = (feld) => (event) => setForm((alt) => ({ ...alt, [feld]: event.target.value }))

  return (
    <Abschnitt id="termin" label={TERMIN.label} headline={TERMIN.headline} text={TERMIN.text} hell>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Card className="p-5">
            <h3 className="flex items-center gap-2.5 text-[0.9375rem] font-semibold text-ink">
              <IconCalendar className="size-4 text-brand-ink" />
              Ablauf des Gesprächs
            </h3>
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
        </div>

        <Card className="p-5 sm:p-6">
          {gesendet ? (
            <div className="py-6 text-center">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-ok-soft text-ok-ink">
                <IconCheck className="size-5" />
              </span>
              <h3 className="mt-4 text-[0.9375rem] font-semibold text-ink">Anfrage vorgemerkt</h3>
              <p className="mx-auto mt-2 max-w-sm text-[0.8125rem] leading-relaxed text-ink-2">
                Dies ist eine Demo – es wurde nichts versendet und nichts gespeichert. In der
                echten Anwendung würde sich das SYMMEDIS-Team innerhalb eines Werktags melden.
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
            </form>
          )}
        </Card>
      </div>
    </Abschnitt>
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

/* -------------------------------------------------------------- Fußzeile */

function Fusszeile({ onRecht }) {
  return (
    <footer className="bg-surface-inverse">
      <div className="shell-container py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <span className="inline-flex items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand">
                S
              </span>
              <span className="text-sm font-semibold text-canvas">SYMMEDIS Diagnosis OS</span>
            </span>
            <p className="mt-3.5 text-[0.8125rem] leading-relaxed text-canvas/70">
              Strategische Ursachenanalyse für erklärungsbedürftige Gesundheits-, MedTech- und
              Premium-Produkte.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-canvas/60">Plattform</p>
              <ul className="mt-3 space-y-2">
                {[
                  { label: 'Produktdemo', to: '/demo' },
                  { label: 'Kundenportal', to: '/login?rolle=kunde' },
                  { label: 'Mitarbeiterportal', to: '/login?rolle=intern' },
                ].map((eintrag) => (
                  <li key={eintrag.label}>
                    <Link
                      to={eintrag.to}
                      className="text-[0.8125rem] text-canvas/80 transition-colors hover:text-canvas"
                    >
                      {eintrag.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-canvas/60">Rechtliches</p>
              <ul className="mt-3 space-y-2">
                {Object.entries(RECHTSTEXTE).map(([id, wert]) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => onRecht(id)}
                      className="text-[0.8125rem] text-canvas/80 transition-colors hover:text-canvas"
                    >
                      {wert.titel}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-canvas/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-canvas/60">{FOOTER.copyright}</p>
          <p className="text-xs text-canvas/60">{FOOTER.hinweis}</p>
        </div>
      </div>
    </footer>
  )
}
