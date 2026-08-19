import { Link, useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useSession } from '../../hooks/useSession.js'
import { PROJEKT_STATUS, TEAM } from '../../data/workspace.js'
import { formatDate, formatRelative, formatTime, tageBis } from '../../lib/format.js'
import { faelligkeit } from '../../lib/aufgaben.js'
import { scoreStufe } from '../../lib/tone.js'
import { Avatar, Button, Chip } from '../../components/ui/primitives.jsx'
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  MetricCard,
  PageHeader,
  Banner,
} from '../../components/ui/layout.jsx'
import { ProgressBar, Timeline } from '../../components/ui/data.jsx'
import { StatusSplit } from '../../components/viz/charts.jsx'
import {
  IconAlert,
  IconArrowRight,
  IconBuilding,
  IconCalendar,
  IconChat,
  IconCheckSquare,
  IconClock,
  IconDocument,
  IconShield,
  IconUsers,
} from '../../components/ui/Icons.jsx'

function FokusLink({ to, icon: Icon, label, value, text, toneName = 'neutral' }) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-line bg-surface p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-line-strong hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-2 transition-colors group-hover:bg-brand-soft group-hover:text-brand-ink">
          <Icon className="size-4.5" />
        </span>
        <Chip size="sm" toneName={toneName}>{value}</Chip>
      </div>
      <p className="mt-4 text-[0.875rem] font-semibold text-ink">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-3">{text}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-ink">
        Öffnen <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

/** Internes Dashboard: Auslastung, Freigabestau, Fristen, Posteingang. */
export function StaffDashboard() {
  const { kunden, kennzahlen } = useWorkspace()
  const { session } = useSession()
  const navigate = useNavigate()

  const dringend = kunden
    .flatMap((kunde) =>
      kunde.aufgaben
        .filter((a) => a.status !== 'erledigt' && a.verantwortlich === 'symmedis')
        .map((a) => ({ ...a, kunde })),
    )
    .sort((a, b) => tageBis(a.faellig) - tageBis(b.faellig))
    .slice(0, 6)

  const freigabeStau = kunden
    .map((kunde) => ({
      kunde,
      anzahl: kunde.analyse.filter((a) => a.freigabe === 'bearbeitet' || a.freigabe === 'intern')
        .length,
    }))
    .filter((eintrag) => eintrag.anzahl > 0)
    .sort((a, b) => b.anzahl - a.anzahl)

  const offeneFragen = kunden
    .map((kunde) => ({ kunde, letzte: kunde.chat.at(-1) }))
    .filter((eintrag) => eintrag.letzte?.from === 'kunde')

  const statusVerteilung = Object.entries(PROJEKT_STATUS).map(([key, wert]) => ({
    label: wert.label,
    tone: wert.tone,
    value: kunden.filter((k) => k.status === key).length,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Guten Tag, ${session?.name ?? 'SYMMEDIS'}`}
        subtitle={`${kennzahlen.aktiveKunden} aktive Projekte · ${kennzahlen.laufendeAnalysen} Analysen in Arbeit · Teamauslastung ${kennzahlen.teamAuslastung} %`}
        actions={
          <>
            <Button as={Link} to="/intern/freigaben" variant="secondary" size="sm">
              <IconShield className="size-4" />
              Freigabezentrum
            </Button>
            <Button as={Link} to="/intern/kunden" size="sm">
              <IconBuilding className="size-4" />
              Kundenliste
            </Button>
          </>
        }
      />

      <section aria-labelledby="arbeitsfokus-title">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">Heute wichtig</p>
            <h2 id="arbeitsfokus-title" className="mt-1 text-lg font-semibold tracking-tight text-ink">Arbeitsfokus</h2>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-ink-3">Die vier Bereiche, die aktuell am ehesten Kundentermine, Freigaben oder Projektfortschritt blockieren.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FokusLink
            to="/intern/freigaben"
            icon={IconShield}
            label="Freigaben prüfen"
            value={kennzahlen.offeneFreigaben}
            toneName={kennzahlen.offeneFreigaben > 0 ? 'warn' : 'ok'}
            text="Analysepunkte, die auf menschliche Prüfung oder interne Freigabe warten."
          />
          <FokusLink
            to="/intern/aufgaben"
            icon={IconClock}
            label="Überfällige Aufgaben"
            value={kennzahlen.ueberfaellig}
            toneName={kennzahlen.ueberfaellig > 0 ? 'urgent' : 'ok'}
            text="Interne Schritte, die einen Kunden- oder Ergebnistermin gefährden können."
          />
          <FokusLink
            to="/intern/posteingang"
            icon={IconChat}
            label="Kundenanfragen"
            value={offeneFragen.length}
            toneName={offeneFragen.length > 0 ? 'info' : 'ok'}
            text="Projektverläufe, in denen die letzte Nachricht vom Kunden stammt."
          />
          <FokusLink
            to="/intern/dokumente"
            icon={IconDocument}
            label="Neue Dokumente"
            value={kennzahlen.neueDokumente}
            toneName={kennzahlen.neueDokumente > 0 ? 'info' : 'ok'}
            text="Neu eingegangene Unterlagen, die noch gesichtet oder eingeordnet werden müssen."
          />
        </div>
      </section>

      {kennzahlen.ueberfaellig > 0 ? (
        <Banner
          toneName="urgent"
          icon={IconAlert}
          title={`${kennzahlen.ueberfaellig} überfällige Aufgaben`}
          action={
            <Button as={Link} to="/intern/aufgaben" variant="secondary" size="sm">
              Ansehen
            </Button>
          }
        >
          Über alle Projekte hinweg. Überfällige Schritte auf SYMMEDIS-Seite blockieren die
          Ergebnistermine der betroffenen Kunden.
        </Banner>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Aktive Projekte"
          value={kennzahlen.aktiveKunden}
          icon={IconBuilding}
          toneName="brand"
          hint={`${kunden.length} insgesamt`}
        />
        <MetricCard
          label="Offene Freigaben"
          value={kennzahlen.offeneFreigaben}
          icon={IconShield}
          toneName={kennzahlen.offeneFreigaben > 10 ? 'warn' : 'neutral'}
          hint="Analysepunkte in Prüfung"
        />
        <MetricCard
          label="Überfällige Aufgaben"
          value={kennzahlen.ueberfaellig}
          icon={IconClock}
          toneName={kennzahlen.ueberfaellig > 0 ? 'urgent' : 'ok'}
          hint={`${kennzahlen.offeneAufgaben} offen insgesamt`}
        />
        <MetricCard
          label="Neue Dokumente"
          value={kennzahlen.neueDokumente}
          icon={IconDocument}
          toneName="info"
          hint="Noch nicht gesichtet"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader
            title="Nächste Schritte auf SYMMEDIS-Seite"
            subtitle="Nach Fälligkeit, projektübergreifend"
            icon={IconCheckSquare}
            action={
              <Button as={Link} to="/intern/aufgaben" variant="ghost" size="sm">
                Alle
              </Button>
            }
          />
          <CardBody className="px-0 py-0">
            {dringend.length === 0 ? (
              <EmptyState
                compact
                icon={IconCheckSquare}
                title="Nichts offen"
                description="Alle internen Aufgaben sind erledigt."
              />
            ) : (
              <ul className="divide-y divide-line">
                {dringend.map((aufgabe) => {
                  const faellt = faelligkeit(aufgabe)
                  return (
                    <li key={aufgabe.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/intern/kunden/${aufgabe.kunde.id}`)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted sm:px-5"
                      >
                        <Avatar name={aufgabe.zustaendig} size="sm" className="mt-0.5" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.8125rem] font-medium text-ink">
                            {aufgabe.titel}
                          </span>
                          <span className="mt-0.5 block text-xs text-ink-3">
                            {aufgabe.kunde.unternehmen} · {aufgabe.zustaendig}
                          </span>
                        </span>
                        <Chip size="sm" toneName={faellt.tone}>
                          {faellt.label}
                        </Chip>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Projekte nach Phase" />
            <CardBody>
              <StatusSplit segments={statusVerteilung} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Teamauslastung" icon={IconUsers} />
            <CardBody className="space-y-3.5">
              {TEAM.map((mitglied) => (
                <div key={mitglied.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.8125rem] font-medium text-ink">{mitglied.name}</span>
                    <span className="tabular text-[0.8125rem] text-ink-2">
                      {mitglied.auslastung} %
                    </span>
                  </div>
                  <p className="text-xs text-ink-3">{mitglied.rolle}</p>
                  <ProgressBar
                    value={mitglied.auslastung}
                    size="sm"
                    className="mt-1.5"
                    hideLabel
                    label={`Auslastung ${mitglied.name}`}
                    toneName={mitglied.auslastung > 85 ? 'warn' : 'brand'}
                  />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader
            title="Freigabestau"
            subtitle="Analysepunkte, die auf Prüfung warten"
            icon={IconShield}
            action={
              <Button as={Link} to="/intern/freigaben" variant="ghost" size="sm">
                Öffnen
              </Button>
            }
          />
          <CardBody className="px-0 py-0">
            {freigabeStau.length === 0 ? (
              <EmptyState
                compact
                icon={IconShield}
                title="Kein Stau"
                description="Alle Bewertungen sind geprüft und freigegeben."
              />
            ) : (
              <ul className="divide-y divide-line">
                {freigabeStau.map(({ kunde, anzahl }) => (
                  <li key={kunde.id}>
                    <Link
                      to={`/intern/kunden/${kunde.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted sm:px-5"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.8125rem] font-medium text-ink">
                          {kunde.unternehmen}
                        </span>
                        <span className="block text-xs text-ink-3">
                          Ergebnistermin {formatDate(kunde.ergebnis)}
                        </span>
                      </span>
                      <Chip size="sm" toneName="warn">
                        {anzahl} offen
                      </Chip>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Offene Anfragen"
            icon={IconChat}
            action={
              <Button as={Link} to="/intern/posteingang" variant="ghost" size="sm">
                Posteingang
              </Button>
            }
          />
          <CardBody className="px-0 py-0">
            {offeneFragen.length === 0 ? (
              <EmptyState
                compact
                icon={IconChat}
                title="Alles beantwortet"
                description="Keine offene Kundenanfrage."
              />
            ) : (
              <ul className="divide-y divide-line">
                {offeneFragen.map(({ kunde, letzte }) => (
                  <li key={kunde.id}>
                    <Link
                      to={`/intern/kunden/${kunde.id}`}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-muted sm:px-5"
                    >
                      <Avatar name={letzte.author} size="sm" className="mt-0.5" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.8125rem] font-medium text-ink">
                          {kunde.kurz}
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-xs text-ink-2">
                          {letzte.text}
                        </span>
                        <span className="mt-0.5 block text-[0.6875rem] text-ink-3">
                          {formatRelative(letzte.zeit)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Nächste Termine"
            icon={IconCalendar}
            action={
              <Button as={Link} to="/intern/termine" variant="ghost" size="sm">
                Alle
              </Button>
            }
          />
          <CardBody className="px-0 py-0">
            {kennzahlen.termine.length === 0 ? (
              <EmptyState compact icon={IconCalendar} title="Keine Termine" />
            ) : (
              <ul className="divide-y divide-line">
                {kennzahlen.termine.slice(0, 5).map((termin) => (
                  <li key={termin.id} className="px-4 py-3 sm:px-5">
                    <p className="text-[0.8125rem] font-medium text-ink">{termin.titel}</p>
                    <p className="mt-0.5 text-xs text-ink-3">
                      {termin.unternehmen} · {formatDate(termin.datum)}, {formatTime(termin.datum)}{' '}
                      Uhr
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Projektübersicht"
          subtitle="Alle Kunden mit Reifegrad und Fortschritt"
          action={
            <Button as={Link} to="/intern/kunden" variant="ghost" size="sm">
              Zur Kundenliste
              <IconArrowRight className="size-4" />
            </Button>
          }
        />
        <CardBody className="px-0 py-0">
          <ul className="divide-y divide-line">
            {kunden.map((kunde) => {
              const stufe = scoreStufe(kunde.gesamtScore)
              const status = PROJEKT_STATUS[kunde.status]
              return (
                <li key={kunde.id}>
                  <Link
                    to={`/intern/kunden/${kunde.id}`}
                    className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-surface-muted sm:flex-row sm:items-center sm:px-5"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={kunde.kurz} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-[0.8125rem] font-medium text-ink">
                          {kunde.unternehmen}
                        </span>
                        <span className="block truncate text-xs text-ink-3">
                          {kunde.branche} · {kunde.ort}
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <Chip size="sm" toneName={status.tone} dot>
                        {status.label}
                      </Chip>
                      <Chip size="sm" toneName={stufe.tone}>
                        Reifegrad {kunde.gesamtScore}
                      </Chip>
                      <span className="tabular text-xs text-ink-3">
                        {kunde.fortschritt} % Fortschritt
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Letzte Aktivitäten" subtitle="Projektübergreifender Verlauf" />
        <CardBody>
          <Timeline
            items={kunden
              .flatMap((kunde) =>
                kunde.aktivitaet.slice(0, 2).map((eintrag) => ({
                  id: `${kunde.id}-${eintrag.id}`,
                  title: eintrag.titel,
                  actor: `${eintrag.actor} · ${kunde.kurz}`,
                  time: formatRelative(eintrag.zeit),
                  tone: eintrag.tone,
                })),
              )
              .slice(0, 8)}
          />
        </CardBody>
      </Card>
    </div>
  )
}
