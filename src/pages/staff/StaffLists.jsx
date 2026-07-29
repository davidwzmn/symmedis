import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { DOKUMENT_TYPEN } from '../../data/catalog.js'
import { TEAM_MAP } from '../../data/workspace.js'
import { formatBytes, formatDate, formatRelative, formatTime, tageBis } from '../../lib/format.js'
import { faelligkeit, naechsterStatus } from '../../lib/aufgaben.js'
import { PRIORITAETEN, scoreStufe } from '../../lib/tone.js'
import { useToast } from '../../hooks/useToast.js'
import { Avatar, Button, Chip } from '../../components/ui/primitives.jsx'
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  PageHeader,
} from '../../components/ui/layout.jsx'
import { DataTable } from '../../components/ui/data.jsx'
import { SearchInput, Segmented } from '../../components/ui/forms.jsx'
import { BarList } from '../../components/viz/charts.jsx'
import {
  IconCalendar,
  IconChat,
  IconCheckSquare,
  IconDocument,
  IconFolder,
  IconShare,
  IconVideo,
} from '../../components/ui/Icons.jsx'

/* --------------------------------------------------------------- Aufgaben */

/** Alle Aufgaben aller Projekte – der interne Arbeitsvorrat. */
export function StaffTasksPage() {
  const { kunden, setAufgabeStatus } = useWorkspace()
  const toast = useToast()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('symmedis')
  const [suche, setSuche] = useState('')

  const alle = useMemo(
    () => kunden.flatMap((kunde) => kunde.aufgaben.map((a) => ({ ...a, kunde }))),
    [kunden],
  )

  const zeilen = useMemo(() => {
    const q = suche.trim().toLowerCase()
    return alle
      .filter((aufgabe) => {
        if (filter === 'symmedis' && aufgabe.verantwortlich !== 'symmedis') return false
        if (filter === 'kunde' && aufgabe.verantwortlich !== 'kunde') return false
        if (filter === 'ueberfaellig' && !faelligkeit(aufgabe).ueberfaellig) return false
        if (filter !== 'erledigt' && aufgabe.status === 'erledigt') return false
        if (filter === 'erledigt' && aufgabe.status !== 'erledigt') return false
        if (q && !aufgabe.titel.toLowerCase().includes(q) && !aufgabe.kunde.kurz.toLowerCase().includes(q))
          return false
        return true
      })
      .sort((a, b) => tageBis(a.faellig) - tageBis(b.faellig))
  }, [alle, filter, suche])

  const weiter = (aufgabe) => {
    const status = naechsterStatus(aufgabe.status)
    setAufgabeStatus(aufgabe.kunde.id, aufgabe.id, status)
    toast.show({ title: 'Status geändert', description: aufgabe.titel, variant: 'success' })
  }

  const spalten = [
    {
      key: 'titel',
      label: 'Aufgabe',
      render: (a) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-ink">{a.titel}</span>
          <span className="block text-xs text-ink-3">
            {a.kunde.kurz} · {a.zustaendig} · Messgröße: {a.kpi}
          </span>
        </span>
      ),
    },
    {
      key: 'verantwortlich',
      label: 'Seite',
      hideBelow: 'lg',
      render: (a) => (
        <Chip size="sm" toneName={a.verantwortlich === 'kunde' ? 'brand' : 'accent'}>
          {a.verantwortlich === 'kunde' ? 'Kunde' : 'SYMMEDIS'}
        </Chip>
      ),
    },
    {
      key: 'prio',
      label: 'Priorität',
      hideBelow: 'xl',
      render: (a) => (
        <Chip size="sm" toneName={PRIORITAETEN[a.prioritaet].tone}>
          {PRIORITAETEN[a.prioritaet].label}
        </Chip>
      ),
    },
    {
      key: 'faellig',
      label: 'Fällig',
      render: (a) => {
        const f = faelligkeit(a)
        return (
          <Chip size="sm" toneName={f.tone}>
            {f.label}
          </Chip>
        )
      },
    },
    {
      key: 'aktion',
      label: '',
      align: 'right',
      render: (a) => (
        <Button variant="ghost" size="xs" onClick={() => weiter(a)}>
          {a.status === 'erledigt' ? 'Öffnen' : a.status === 'offen' ? 'Starten' : 'Abschließen'}
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aufgaben"
        subtitle={`${zeilen.length} Aufgaben in der aktuellen Auswahl, projektübergreifend`}
      />

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Segmented
            label="Aufgaben filtern"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'symmedis', label: 'Bei SYMMEDIS' },
              { value: 'kunde', label: 'Beim Kunden' },
              { value: 'ueberfaellig', label: 'Überfällig' },
              { value: 'erledigt', label: 'Erledigt' },
            ]}
          />
          <SearchInput
            value={suche}
            onChange={(event) => setSuche(event.target.value)}
            placeholder="Aufgabe oder Kunde …"
            label="Aufgaben durchsuchen"
            className="sm:w-64"
          />
        </CardBody>
        <div className="border-t border-line">
          <DataTable
            caption="Aufgaben aller Projekte"
            columns={spalten}
            rows={zeilen}
            getKey={(a) => a.id}
            empty={
              <EmptyState
                icon={IconCheckSquare}
                title="Keine Aufgaben in dieser Auswahl"
                description="Wechseln Sie den Filter, um weitere Aufgaben zu sehen."
              />
            }
            renderCard={(a) => {
              const f = faelligkeit(a)
              return (
                <button
                  type="button"
                  onClick={() => navigate(`/intern/kunden/${a.kunde.id}`)}
                  className="w-full text-left"
                >
                  <p className="text-[0.8125rem] font-medium text-ink">{a.titel}</p>
                  <p className="mt-0.5 text-xs text-ink-3">
                    {a.kunde.kurz} · {a.zustaendig}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Chip size="sm" toneName={f.tone}>
                      {f.label}
                    </Chip>
                    <Chip size="sm" toneName={PRIORITAETEN[a.prioritaet].tone}>
                      {PRIORITAETEN[a.prioritaet].label}
                    </Chip>
                  </div>
                </button>
              )
            }}
          />
        </div>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------- Dokumente */

export function StaffDocumentsPage() {
  const { kunden } = useWorkspace()
  const navigate = useNavigate()
  const [nurNeu, setNurNeu] = useState('neu')

  const zeilen = useMemo(() => {
    const alle = kunden.flatMap((kunde) => kunde.dokumente.map((d) => ({ ...d, kunde })))
    return nurNeu === 'neu' ? alle.filter((d) => d.status === 'neu') : alle
  }, [kunden, nurNeu])

  const spalten = [
    {
      key: 'name',
      label: 'Dokument',
      render: (d) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2">
            <IconDocument className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{d.name}</span>
            <span className="block text-xs text-ink-3">
              {d.kunde.kurz} · {DOKUMENT_TYPEN[d.typ]?.label ?? d.typ} · {formatBytes(d.groesse)}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'von',
      label: 'Quelle',
      hideBelow: 'lg',
      render: (d) => (
        <Chip size="sm" toneName={d.von === 'kunde' ? 'brand' : 'accent'}>
          {d.von === 'kunde' ? 'Kunde' : 'SYMMEDIS'}
        </Chip>
      ),
    },
    { key: 'version', label: 'Version', hideBelow: 'xl', render: (d) => <span className="text-ink-2">v{d.version}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (d) => (
        <Chip size="sm" toneName={d.status === 'geprueft' ? 'ok' : 'info'}>
          {d.status === 'geprueft' ? 'Gesichtet' : 'Neu'}
        </Chip>
      ),
    },
    {
      key: 'datum',
      label: 'Eingang',
      hideBelow: 'md',
      align: 'right',
      render: (d) => <span className="text-ink-2">{formatDate(d.hochgeladen)}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumente"
        subtitle="Eingang aller Projekte. Neue Unterlagen zuerst sichten, dann in die Analyse überführen."
        actions={
          <Segmented
            label="Dokumente filtern"
            value={nurNeu}
            onChange={setNurNeu}
            options={[
              { value: 'neu', label: 'Nur neue' },
              { value: 'alle', label: 'Alle' },
            ]}
          />
        }
      />

      <Card>
        <DataTable
          caption="Dokumente aller Projekte"
          columns={spalten}
          rows={zeilen}
          getKey={(d) => `${d.kunde.id}-${d.id}`}
          onRowClick={(d) => navigate(`/intern/kunden/${d.kunde.id}`)}
          empty={
            <EmptyState
              icon={IconFolder}
              title="Keine neuen Dokumente"
              description="Alle eingegangenen Unterlagen sind gesichtet."
            />
          }
          renderCard={(d) => (
            <div>
              <p className="truncate text-[0.8125rem] font-medium text-ink">{d.name}</p>
              <p className="mt-0.5 text-xs text-ink-3">
                {d.kunde.kurz} · {formatBytes(d.groesse)} · {formatDate(d.hochgeladen)}
              </p>
            </div>
          )}
        />
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ Social */

export function StaffSocialPage() {
  const { kunden } = useWorkspace()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Media"
        subtitle="Kanalreife aller Projekte. Werte stammen aus öffentlich sichtbaren Beiträgen der letzten 90 Tage (Demo-Datenstand)."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {kunden.map((kunde) => {
          const verbunden = kunde.social.plattformen.filter((p) => p.verbunden)
          const stufe = scoreStufe(kunde.social.gesamt)
          return (
            <Card key={kunde.id}>
              <CardHeader
                title={kunde.kurz}
                subtitle={`${verbunden.length} von ${kunde.social.plattformen.length} Kanälen verbunden`}
                icon={IconShare}
                action={
                  <Chip size="sm" toneName={stufe.tone}>
                    {kunde.social.gesamt}
                  </Chip>
                }
              />
              <CardBody className="space-y-4">
                <BarList
                  items={verbunden.map((p) => ({ label: p.label, value: p.score }))}
                  max={100}
                />
                <Button
                  as={Link}
                  to={`/intern/kunden/${kunde.id}`}
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                >
                  Kundenakte öffnen
                </Button>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Berichte */

export function StaffReportsPage() {
  const { kunden } = useWorkspace()
  const navigate = useNavigate()

  const zeilen = useMemo(
    () => kunden.flatMap((kunde) => kunde.berichte.map((b) => ({ ...b, kunde }))),
    [kunden],
  )

  const spalten = [
    {
      key: 'titel',
      label: 'Bericht',
      render: (b) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-ink">{b.titel}</span>
          <span className="block text-xs text-ink-3">
            {b.kunde.kurz} · {b.typ} · {b.seiten} Seiten
          </span>
        </span>
      ),
    },
    { key: 'autor', label: 'Autor', hideBelow: 'lg', render: (b) => <span className="text-ink-2">{b.autor}</span> },
    {
      key: 'stand',
      label: 'Stand',
      render: (b) => (
        <Chip size="sm" toneName={b.stand === 'final' ? 'ok' : 'warn'}>
          {b.stand === 'final' ? 'Freigegeben' : 'Entwurf'}
        </Chip>
      ),
    },
    {
      key: 'datum',
      label: 'Datum',
      hideBelow: 'md',
      align: 'right',
      render: (b) => <span className="text-ink-2">{formatDate(b.datum)}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Berichte"
        subtitle="Alle Strategie- und Teilberichte. Entwürfe sind für Kunden nicht sichtbar."
      />
      <Card>
        <DataTable
          caption="Berichte aller Projekte"
          columns={spalten}
          rows={zeilen}
          getKey={(b) => `${b.kunde.id}-${b.id}`}
          onRowClick={(b) => navigate(`/intern/kunden/${b.kunde.id}`)}
          renderCard={(b) => (
            <div>
              <p className="text-[0.8125rem] font-medium text-ink">{b.titel}</p>
              <p className="mt-0.5 text-xs text-ink-3">
                {b.kunde.kurz} · {b.autor} · {formatDate(b.datum)}
              </p>
            </div>
          )}
        />
      </Card>
    </div>
  )
}

/* ----------------------------------------------------------------- Termine */

export function StaffAppointmentsPage() {
  const { kennzahlen } = useWorkspace()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Termine"
        subtitle={`${kennzahlen.termine.length} anstehende Besprechungen über alle Projekte`}
      />

      <Card>
        <CardHeader title="Anstehend" icon={IconCalendar} />
        <CardBody className="px-0 py-0">
          {kennzahlen.termine.length === 0 ? (
            <EmptyState
              icon={IconCalendar}
              title="Keine anstehenden Termine"
              description="Alle Besprechungen dieser Woche sind abgeschlossen."
            />
          ) : (
            <ul className="divide-y divide-line">
              {kennzahlen.termine.map((termin) => (
                <li key={termin.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-surface-muted">
                    <span className="tabular text-sm font-semibold text-ink">
                      {new Date(termin.datum).getDate()}
                    </span>
                    <span className="text-[0.625rem] text-ink-3">
                      {new Date(termin.datum).toLocaleDateString('de-DE', { month: 'short' })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.875rem] font-medium text-ink">{termin.titel}</p>
                    <p className="mt-0.5 text-xs text-ink-3">
                      {termin.unternehmen} · {formatTime(termin.datum)} Uhr · {termin.dauer} Minuten
                    </p>
                    <p className="mt-1 truncate text-xs text-ink-2">
                      {termin.teilnehmer.join(', ')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Chip
                      size="sm"
                      toneName={termin.typ === 'video' ? 'info' : 'accent'}
                      icon={termin.typ === 'video' ? IconVideo : undefined}
                    >
                      {termin.typ === 'video' ? 'Videokonferenz' : 'Vor Ort'}
                    </Chip>
                    <Button as={Link} to={`/intern/kunden/${termin.kundeId}`} variant="ghost" size="sm">
                      Akte
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------- Posteingang */

export function StaffInboxPage() {
  const { kunden } = useWorkspace()

  const eintraege = useMemo(
    () =>
      kunden
        .map((kunde) => ({ kunde, letzte: kunde.chat.at(-1) }))
        .filter((eintrag) => eintrag.letzte)
        .sort((a, b) => new Date(b.letzte.zeit) - new Date(a.letzte.zeit)),
    [kunden],
  )

  const offen = eintraege.filter((e) => e.letzte.from === 'kunde')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Posteingang"
        subtitle={`${offen.length} unbeantwortete Anfragen von ${eintraege.length} Projekten`}
      />

      <Card>
        <CardHeader title="Nachrichtenverläufe" icon={IconChat} />
        <CardBody className="px-0 py-0">
          <ul className="divide-y divide-line">
            {eintraege.map(({ kunde, letzte }) => (
              <li key={kunde.id}>
                <Link
                  to={`/intern/kunden/${kunde.id}`}
                  className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-surface-muted sm:px-5"
                >
                  <Avatar name={letzte.author} className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[0.875rem] font-semibold text-ink">
                        {kunde.unternehmen}
                      </span>
                      <span className="text-xs text-ink-3">{formatRelative(letzte.zeit)}</span>
                      {letzte.from === 'kunde' ? (
                        <Chip size="sm" toneName="urgent">
                          Antwort offen
                        </Chip>
                      ) : (
                        <Chip size="sm" toneName="ok">
                          Beantwortet
                        </Chip>
                      )}
                    </span>
                    <span className="mt-1 block line-clamp-2 text-[0.8125rem] leading-relaxed text-ink-2">
                      <span className="font-medium text-ink">{letzte.author}: </span>
                      {letzte.text}
                    </span>
                    <span className="mt-1 block text-xs text-ink-3">
                      Betreuung: {TEAM_MAP[kunde.betreuerId].name}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
