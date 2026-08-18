import { formatDate, formatRelative, formatTime, HEUTE } from '../../lib/format.js'
import { Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState } from '../ui/layout.jsx'
import { IconCalendar, IconClock, IconUsers, IconVideo } from '../ui/Icons.jsx'

function gueltigesDatum(value) {
  if (!value) return null
  const datum = new Date(value)
  return Number.isNaN(datum.getTime()) ? null : datum
}

function terminTyp(typ) {
  if (typ === 'video') return { label: 'Videokonferenz', tone: 'info', icon: IconVideo }
  if (typ === 'vor-ort' || typ === 'vor_ort' || typ === 'praesenz') return { label: 'Vor Ort', tone: 'accent', icon: null }
  return { label: 'Termin', tone: 'neutral', icon: null }
}

function teilnehmerText(termin) {
  return Array.isArray(termin.teilnehmer) && termin.teilnehmer.length ? termin.teilnehmer.join(', ') : 'Teilnehmer werden abgestimmt'
}

export function AppointmentsModule({ kunde }) {
  const sortiert = [...kunde.termine]
    .map((termin) => ({ ...termin, _datum: gueltigesDatum(termin.datum) }))
    .sort((a, b) => (a._datum?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b._datum?.getTime() ?? Number.MAX_SAFE_INTEGER))
  const kommend = sortiert.filter((t) => t._datum && t._datum >= HEUTE)
  const vergangen = sortiert.filter((t) => t._datum && t._datum < HEUTE).reverse()
  const unvollstaendig = sortiert.filter((t) => !t._datum)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Kommende Termine" subtitle="Alle Zeiten in mitteleuropäischer Zeit" icon={IconCalendar} />
        <CardBody className="px-0 py-0">
          {kommend.length === 0 ? <EmptyState icon={IconCalendar} title="Keine offenen Termine" description="Das Projekt hat aktuell keine geplanten Besprechungen. Sobald ein Termin abgestimmt ist, erscheint er hier." /> : <ul className="divide-y divide-line">{kommend.map((termin) => <TerminZeile key={termin.id} termin={termin} kommend />)}</ul>}
        </CardBody>
      </Card>

      {vergangen.length > 0 ? <Card><CardHeader title="Vergangene Termine" /><CardBody className="px-0 py-0"><ul className="divide-y divide-line">{vergangen.map((termin) => <TerminZeile key={termin.id} termin={termin} />)}</ul></CardBody></Card> : null}

      {unvollstaendig.length > 0 ? <Card><CardHeader title="Terminabstimmung" subtitle={`${unvollstaendig.length} ${unvollstaendig.length === 1 ? 'Eintrag benötigt' : 'Einträge benötigen'} noch ein Datum`} /><CardBody className="px-0 py-0"><ul className="divide-y divide-line">{unvollstaendig.map((termin) => <li key={termin.id} className="px-4 py-4 sm:px-5"><p className="text-[0.875rem] font-medium text-ink">{termin.titel || 'Termin in Abstimmung'}</p><p className="mt-1 text-xs text-ink-3">Datum und Uhrzeit werden noch abgestimmt.</p></li>)}</ul></CardBody></Card> : null}
    </div>
  )
}

function TerminZeile({ termin, kommend = false }) {
  const datum = termin._datum || gueltigesDatum(termin.datum)
  if (!datum) return null
  const typ = terminTyp(termin.typ)
  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
      <div className="flex shrink-0 items-center gap-3"><div className="flex size-12 flex-col items-center justify-center rounded-lg border border-line bg-surface-muted"><span className="tabular text-sm font-semibold text-ink">{datum.getDate()}</span><span className="text-[0.625rem] text-ink-3">{datum.toLocaleDateString('de-DE', { month: 'short' })}</span></div></div>
      <div className="min-w-0 flex-1">
        <p className="text-[0.875rem] font-medium text-ink">{termin.titel || 'Projekttermin'}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-3"><span className="inline-flex items-center gap-1"><IconClock className="size-3.5" />{formatTime(termin.datum)} Uhr{termin.dauer ? ` · ${termin.dauer} Minuten` : ''}</span><span aria-hidden="true">·</span><span>{formatDate(termin.datum)}</span></p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-2"><IconUsers className="size-3.5 shrink-0 text-ink-3" /><span className="truncate">{teilnehmerText(termin)}</span></p>
      </div>
      <div className="flex shrink-0 items-center gap-2"><Chip size="sm" toneName={typ.tone} icon={typ.icon || undefined}>{typ.label}</Chip>{kommend ? <Chip size="sm" toneName="neutral">{formatRelative(termin.datum)}</Chip> : null}</div>
    </li>
  )
}

export function NaechsterTermin({ kunde }) {
  const naechster = [...kunde.termine]
    .map((termin) => ({ ...termin, _datum: gueltigesDatum(termin.datum) }))
    .filter((t) => t._datum && t._datum >= HEUTE)
    .sort((a, b) => a._datum - b._datum)[0]

  if (!naechster) return <Card><CardHeader title="Nächster Termin" icon={IconCalendar} /><EmptyState compact icon={IconCalendar} title="Kein Termin geplant" description="Das SYMMEDIS-Team meldet sich für die Terminabstimmung. Sobald ein Termin feststeht, erscheint er hier." /></Card>

  const typ = terminTyp(naechster.typ)
  return (
    <Card>
      <CardHeader title="Nächster Termin" icon={IconCalendar} />
      <CardBody>
        <p className="text-[0.875rem] font-semibold text-ink">{naechster.titel || 'Projekttermin'}</p>
        <p className="mt-1 text-[0.8125rem] text-ink-2">{formatDate(naechster.datum)} · {formatTime(naechster.datum)} Uhr{naechster.dauer ? ` · ${naechster.dauer} Min.` : ''}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5"><Chip size="sm" toneName={typ.tone}>{typ.label}</Chip><Chip size="sm" toneName="neutral">{formatRelative(naechster.datum)}</Chip></div>
        <p className="mt-2.5 flex items-start gap-1.5 text-xs text-ink-3"><IconUsers className="mt-0.5 size-3.5 shrink-0" />{teilnehmerText(naechster)}</p>
      </CardBody>
    </Card>
  )
}
