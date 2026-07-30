import { Link } from 'react-router-dom'
import { KATEGORIE_MAP } from '../../data/catalog.js'
import { PROJEKT_STATUS } from '../../data/workspace.js'
import { formatDate, formatRelative, tageBis } from '../../lib/format.js'
import { faelligkeit } from '../../lib/aufgaben.js'
import { scoreStufe } from '../../lib/tone.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, MetricCard, PageHeader, Banner, EmptyState } from '../ui/layout.jsx'
import { ProgressBar } from '../ui/data.jsx'
import { BremsenCards, AnalyseUebersicht } from './AnalysisModule.jsx'
import { PlanVorschau } from './PlanModule.jsx'
import { AufgabenVorschau } from './TasksModule.jsx'
import { SocialUeberblick } from './SocialModule.jsx'
import { NaechsterTermin } from './AppointmentsModule.jsx'
import { ActivityFeed } from './ActivityFeed.jsx'
import {
  IconAlert,
  IconArrowRight,
  IconChat,
  IconCheckCircle,
  IconClock,
  IconDocument,
  IconShield,
  IconTarget,
  IconUsers,
} from '../ui/Icons.jsx'

/** Nächster sinnvoller Schritt aus dem Projektzustand. */
function naechsteAktion(kunde) {
  const ueberfaellig = kunde.aufgaben.filter(
    (a) => a.status !== 'erledigt' && faelligkeit(a).ueberfaellig && a.verantwortlich === 'kunde',
  )
  if (ueberfaellig.length > 0) {
    return {
      titel: ueberfaellig[0].titel,
      text: `${ueberfaellig.length} überfällige Aufgabe(n) in Ihrer Verantwortung blockieren den nächsten Schritt.`,
      tone: 'urgent',
      ziel: 'aufgaben',
      label: 'Aufgaben öffnen',
    }
  }

  const neueDokumente = kunde.dokumente.filter((d) => d.status === 'neu')
  if (kunde.status === 'onboarding') {
    return {
      titel: 'Unterlagen vervollständigen',
      text: 'Für den Analysestart fehlen noch Vertriebsunterlagen und Produktkatalog.',
      tone: 'warn',
      ziel: 'dokumente',
      label: 'Dokumente öffnen',
    }
  }
  if (neueDokumente.length > 0) {
    return {
      titel: `${neueDokumente.length} Dokument(e) in Sichtung`,
      text: 'Das SYMMEDIS-Team wertet die zuletzt hochgeladenen Unterlagen aus.',
      tone: 'info',
      ziel: 'dokumente',
      label: 'Dokumente ansehen',
    }
  }

  const offen = kunde.aufgaben
    .filter((a) => a.status !== 'erledigt' && a.verantwortlich === 'kunde')
    .sort((a, b) => tageBis(a.faellig) - tageBis(b.faellig))[0]
  if (offen) {
    return {
      titel: offen.titel,
      text: `Fällig ${formatDate(offen.faellig)} · Messgröße: ${offen.kpi}`,
      tone: 'brand',
      ziel: 'aufgaben',
      label: 'Aufgabe öffnen',
    }
  }

  return {
    titel: 'Ergebnisgespräch vorbereiten',
    text: 'Alle Aufgaben in Ihrer Verantwortung sind erledigt.',
    tone: 'ok',
    ziel: 'plan',
    label: '90-Tage-Plan ansehen',
  }
}

/**
 * Projekt-Cockpit für Kundenportal und Demo.
 *
 * `basis` ist das Routen-Präfix (z. B. „/portal“ oder „/demo“), damit derselbe
 * Aufbau in beiden Bereichen verlinkt werden kann.
 */
export function ProjectDashboard({ kunde, basis, rolle = 'kunde', begruessung }) {
  const status = PROJEKT_STATUS[kunde.status]
  const aktion = naechsteAktion(kunde)
  const stufe = scoreStufe(kunde.gesamtScore)

  // Größte Wachstumsbremse = niedrigster Reifegrad (bevorzugt bereits
  // freigegebene Dimensionen), rein aus dem bestehenden Beispieldatensatz.
  const bremse =
    [...kunde.analyse].filter((a) => a.sichtbarKunde).sort((a, b) => a.score - b.score)[0] ??
    [...kunde.analyse].sort((a, b) => a.score - b.score)[0]

  const freigegeben = kunde.analyse.filter((a) => a.sichtbarKunde).length
  const inPruefung = kunde.analyse.length - freigegeben
  const offeneAufgaben = kunde.aufgaben.filter((a) => a.status !== 'erledigt').length
  const letzteRueckmeldung = kunde.chat.filter((n) => n.from === 'symmedis').at(-1)

  return (
    <div className="space-y-6">
      <PageHeader
        title={begruessung ?? `Guten Tag, ${kunde.ansprechpartner.name.split(' ').at(-1)}`}
        subtitle={`Ursachenanalyse für ${kunde.unternehmen} · Analysestart ${formatDate(kunde.start)} · Ergebnistermin ${formatDate(kunde.ergebnis)}`}
        meta={
          <>
            <Chip toneName={status.tone} dot>
              {status.label}
            </Chip>
            <Chip toneName="neutral" icon={IconUsers}>
              Betreuung: {kunde.ansprechpartner.rolle === 'Geschäftsführung' ? 'SYMMEDIS Team' : 'SYMMEDIS Team'}
            </Chip>
            <Chip toneName="accent" icon={IconShield}>
              Menschlich geprüft
            </Chip>
          </>
        }
        actions={
          <Button as={Link} to={`${basis}/nachrichten`} variant="secondary" size="sm">
            <IconChat className="size-4" />
            Nachricht an SYMMEDIS
          </Button>
        }
      />

      {/* Mobile Kurzzusammenfassung – nur auf kleinen Viewports, das Wichtigste
          zuerst. Das vollständige Dashboard darunter bleibt unverändert. */}
      <Card className="lg:hidden">
        <CardBody className="space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.8125rem] font-medium text-ink-2">Reifegrad</span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold tabular text-ink">{kunde.gesamtScore}</span>
              <span className="text-xs text-ink-3">/ 100</span>
              <Chip size="sm" toneName={stufe.tone} className="ml-1">
                {stufe.label}
              </Chip>
            </span>
          </div>
          {bremse ? (
            <div className="border-t border-line pt-3">
              <span className="text-[0.8125rem] font-medium text-ink-2">Größte Wachstumsbremse</span>
              <p className="mt-1 text-[0.8125rem] font-semibold text-ink">
                {KATEGORIE_MAP[bremse.kategorieId]?.label}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-ink-2">
                {bremse.beobachtung}
              </p>
            </div>
          ) : null}
          <div className="border-t border-line pt-3">
            <span className="text-[0.8125rem] font-medium text-ink-2">Nächster Schritt</span>
            <p className="mt-1 text-[0.8125rem] font-semibold text-ink">{aktion.titel}</p>
          </div>
          <Button as={Link} to={`${basis}/analyse`} size="sm" fullWidth className="mt-1">
            Vollständige Analyse öffnen
            <IconArrowRight className="size-4" />
          </Button>
        </CardBody>
      </Card>

      {/* Nächster Schritt – die wichtigste Information der Seite */}
      <Banner
        toneName={aktion.tone}
        icon={aktion.tone === 'urgent' ? IconAlert : IconTarget}
        title={`Nächster Schritt: ${aktion.titel}`}
        action={
          <Button as={Link} to={`${basis}/${aktion.ziel}`} size="sm" variant="secondary">
            {aktion.label}
            <IconArrowRight className="size-4" />
          </Button>
        }
      >
        {aktion.text}
      </Banner>

      {/* Kennzahlen */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Gesamtreifegrad"
          value={kunde.gesamtScore}
          unit="/ 100"
          icon={IconTarget}
          toneName={stufe.tone}
          hint={`Stufe: ${stufe.label}`}
        />
        <MetricCard
          label="Analysefortschritt"
          value={`${kunde.fortschritt} %`}
          icon={IconCheckCircle}
          toneName="brand"
          hint={`${freigegeben} von ${kunde.analyse.length} Punkten freigegeben`}
          footer={<ProgressBar value={kunde.fortschritt} size="sm" hideLabel label="Analysefortschritt" />}
        />
        <MetricCard
          label="Offene Aufgaben"
          value={offeneAufgaben}
          icon={IconClock}
          toneName={offeneAufgaben > 5 ? 'warn' : 'neutral'}
          hint={`${kunde.aufgaben.length - offeneAufgaben} erledigt`}
        />
        <MetricCard
          label="Tage bis Ergebnistermin"
          value={Math.max(0, tageBis(kunde.ergebnis))}
          icon={IconDocument}
          toneName="accent"
          hint={formatDate(kunde.ergebnis)}
        />
      </div>

      {/* Status der menschlichen Prüfung */}
      <Card>
        <CardHeader
          title="Stand der menschlichen Prüfung"
          subtitle="Software strukturiert, das SYMMEDIS-Team bewertet und gibt frei"
          icon={IconShield}
        />
        <CardBody className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Chip toneName="ok" icon={IconCheckCircle}>
              {freigegeben} freigegeben
            </Chip>
            <Chip toneName={inPruefung > 0 ? 'warn' : 'neutral'} icon={inPruefung > 0 ? IconClock : undefined}>
              {inPruefung} in Prüfung
            </Chip>
          </div>
          <ProgressBar
            value={(freigegeben / kunde.analyse.length) * 100}
            label={`${freigegeben} von ${kunde.analyse.length} Analysedimensionen freigegeben`}
            toneName={inPruefung === 0 ? 'ok' : 'brand'}
          />
          <p className="text-[0.8125rem] leading-relaxed text-ink-2">
            Kein Analysepunkt wird automatisch veröffentlicht. Jede Bewertung durchläuft die
            Prüfung durch unser Team, bevor sie hier erscheint.
          </p>
        </CardBody>
      </Card>

      {/* Drei größte Umsatzbremsen */}
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">Die drei größten Umsatzbremsen</h2>
          <Button as={Link} to={`${basis}/analyse`} variant="ghost" size="sm">
            Zur Analyse
          </Button>
        </div>
        <BremsenCards kunde={kunde} />
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <AnalyseUebersicht kunde={kunde} />
        <PlanVorschau kunde={kunde} />
        <AufgabenVorschau kunde={kunde} nurRolle="kunde" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SocialUeberblick kunde={kunde} />

        <Card>
          <CardHeader title="Letzte Rückmeldung" subtitle="Aus dem Nachrichtenverlauf" icon={IconChat} />
          <CardBody>
            {letzteRueckmeldung ? (
              <>
                <p className="text-[0.875rem] leading-relaxed text-ink">
                  {letzteRueckmeldung.text.length > 220
                    ? `${letzteRueckmeldung.text.slice(0, 220)} …`
                    : letzteRueckmeldung.text}
                </p>
                <p className="mt-2.5 text-xs text-ink-3">
                  {letzteRueckmeldung.author} · {formatRelative(letzteRueckmeldung.zeit)}
                </p>
                <Button
                  as={Link}
                  to={`${basis}/nachrichten`}
                  variant="ghost"
                  size="sm"
                  className="mt-3 -ml-3"
                >
                  Verlauf öffnen
                  <IconArrowRight className="size-4" />
                </Button>
              </>
            ) : (
              <EmptyState
                compact
                icon={IconChat}
                title="Noch keine Rückmeldung"
                description="Sobald das Team antwortet, erscheint die Nachricht hier."
              />
            )}
          </CardBody>
        </Card>

        <NaechsterTermin kunde={kunde} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <ActivityFeed kunde={kunde} titel="Projektverlauf" limit={5} />

        <Card>
          <CardHeader
            title="Zuletzt hinzugefügte Dokumente"
            icon={IconDocument}
            action={
              <Button as={Link} to={`${basis}/dokumente`} variant="ghost" size="sm">
                Alle
              </Button>
            }
          />
          <CardBody className="px-0 py-0">
            <ul className="divide-y divide-line">
              {kunde.dokumente.slice(0, 5).map((dokument) => (
                <li key={dokument.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2">
                    <IconDocument className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.8125rem] font-medium text-ink">
                      {dokument.name}
                    </span>
                    <span className="block text-xs text-ink-3">
                      {dokument.von === 'kunde' ? kunde.kurz : 'SYMMEDIS'} ·{' '}
                      {formatDate(dokument.hochgeladen)}
                    </span>
                  </span>
                  <Chip size="sm" toneName={dokument.status === 'geprueft' ? 'ok' : 'info'}>
                    {dokument.status === 'geprueft' ? 'Gesichtet' : 'Neu'}
                  </Chip>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      {rolle === 'demo' ? (
        <Banner toneName="neutral" icon={IconShield} title="Demo-Datenstand">
          Alle Werte auf dieser Seite stammen aus einem fiktiven Beispielprojekt
          ({KATEGORIE_MAP.positionierung.label} bis {KATEGORIE_MAP.wettbewerb.label}). Es besteht
          keine Verbindung zu echten Unternehmensdaten.
        </Banner>
      ) : null}
    </div>
  )
}
