import { formatDate, formatRelative, formatTime, HEUTE } from '../../lib/format.js'
import { Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState } from '../ui/layout.jsx'
import { IconCalendar, IconClock, IconUsers, IconVideo } from '../ui/Icons.jsx'

/** Termine des Projekts – kommende zuerst, vergangene abgesetzt darunter. */
export function AppointmentsModule({ kunde }) {
  const sortiert = [...kunde.termine].sort((a, b) => new Date(a.datum) - new Date(b.datum))
  const kommend = sortiert.filter((t) => new Date(t.datum) >= HEUTE)
  const vergangen = sortiert.filter((t) => new Date(t.datum) < HEUTE).reverse()

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Kommende Termine"
          subtitle="Alle Zeiten in mitteleuropäischer Zeit"
          icon={IconCalendar}
        />
        <CardBody className="px-0 py-0">
          {kommend.length === 0 ? (
            <EmptyState
              icon={IconCalendar}
              title="Keine offenen Termine"
              description="Das Projekt hat aktuell keine geplanten Besprechungen."
            />
          ) : (
            <ul className="divide-y divide-line">
              {kommend.map((termin) => (
                <TerminZeile key={termin.id} termin={termin} kommend />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {vergangen.length > 0 ? (
        <Card>
          <CardHeader title="Vergangene Termine" />
          <CardBody className="px-0 py-0">
            <ul className="divide-y divide-line">
              {vergangen.map((termin) => (
                <TerminZeile key={termin.id} termin={termin} />
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}

function TerminZeile({ termin, kommend = false }) {
  const datum = new Date(termin.datum)
  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex size-12 flex-col items-center justify-center rounded-lg border border-line bg-surface-muted">
          <span className="tabular text-sm font-semibold text-ink">{datum.getDate()}</span>
          <span className="text-[0.625rem] text-ink-3">
            {datum.toLocaleDateString('de-DE', { month: 'short' })}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[0.875rem] font-medium text-ink">{termin.titel}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-3">
          <span className="inline-flex items-center gap-1">
            <IconClock className="size-3.5" />
            {formatTime(termin.datum)} Uhr · {termin.dauer} Minuten
          </span>
          <span aria-hidden="true">·</span>
          <span>{formatDate(termin.datum)}</span>
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-2">
          <IconUsers className="size-3.5 shrink-0 text-ink-3" />
          <span className="truncate">{termin.teilnehmer.join(', ')}</span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Chip size="sm" toneName={termin.typ === 'video' ? 'info' : 'accent'} icon={termin.typ === 'video' ? IconVideo : undefined}>
          {termin.typ === 'video' ? 'Videokonferenz' : 'Vor Ort'}
        </Chip>
        {kommend ? (
          <Chip size="sm" toneName="neutral">
            {formatRelative(termin.datum)}
          </Chip>
        ) : null}
      </div>
    </li>
  )
}

/** Kompakte Terminkachel für Dashboards. */
export function NaechsterTermin({ kunde }) {
  const naechster = [...kunde.termine]
    .filter((t) => new Date(t.datum) >= HEUTE)
    .sort((a, b) => new Date(a.datum) - new Date(b.datum))[0]

  if (!naechster) {
    return (
      <Card>
        <CardHeader title="Nächster Termin" icon={IconCalendar} />
        <EmptyState
          compact
          icon={IconCalendar}
          title="Kein Termin geplant"
          description="Das SYMMEDIS-Team meldet sich für die Terminabstimmung."
        />
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title="Nächster Termin" icon={IconCalendar} />
      <CardBody>
        <p className="text-[0.875rem] font-semibold text-ink">{naechster.titel}</p>
        <p className="mt-1 text-[0.8125rem] text-ink-2">
          {formatDate(naechster.datum)} · {formatTime(naechster.datum)} Uhr · {naechster.dauer} Min.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Chip size="sm" toneName={naechster.typ === 'video' ? 'info' : 'accent'}>
            {naechster.typ === 'video' ? 'Videokonferenz' : 'Vor Ort'}
          </Chip>
          <Chip size="sm" toneName="neutral">
            {formatRelative(naechster.datum)}
          </Chip>
        </div>
        <p className="mt-2.5 flex items-start gap-1.5 text-xs text-ink-3">
          <IconUsers className="mt-0.5 size-3.5 shrink-0" />
          {naechster.teilnehmer.join(', ')}
        </p>
      </CardBody>
    </Card>
  )
}
