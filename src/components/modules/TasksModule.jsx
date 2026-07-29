import { useMemo, useState } from 'react'
import { cn } from '../../lib/cn.js'
import { KATEGORIE_MAP } from '../../data/catalog.js'
import { tageBis } from '../../lib/format.js'
import { faelligkeit, naechsterStatus } from '../../lib/aufgaben.js'
import { PRIORITAETEN, STATUS } from '../../lib/tone.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useToast } from '../../hooks/useToast.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState, Banner } from '../ui/layout.jsx'
import { Segmented, SearchInput } from '../ui/forms.jsx'
import { StatusSplit } from '../viz/charts.jsx'
import {
  IconCheck,
  IconCheckSquare,
  IconClock,
  IconKanban,
  IconList,
  IconUser,
  IconUsers,
} from '../ui/Icons.jsx'

const SPALTEN = [
  { id: 'offen', label: 'Offen' },
  { id: 'in-arbeit', label: 'In Arbeit' },
  { id: 'erledigt', label: 'Erledigt' },
]

/**
 * Aufgabenverwaltung. Liste oder Board, gefiltert nach Zuständigkeit.
 * `rolle = 'demo'` schaltet die Statusänderung ab.
 */
export function TasksModule({ kunde, rolle = 'kunde' }) {
  const { setAufgabeStatus } = useWorkspace()
  const toast = useToast()
  const [ansicht, setAnsicht] = useState('liste')
  const [filter, setFilter] = useState('alle')
  const [suche, setSuche] = useState('')

  const schreibbar = rolle !== 'demo'

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase()
    return kunde.aufgaben.filter((aufgabe) => {
      if (filter === 'meine') {
        const eigen = rolle === 'kunde' ? 'kunde' : 'symmedis'
        if (aufgabe.verantwortlich !== eigen) return false
      }
      if (filter === 'offen' && aufgabe.status === 'erledigt') return false
      if (filter === 'ueberfaellig' && !faelligkeit(aufgabe).ueberfaellig) return false
      if (q && !aufgabe.titel.toLowerCase().includes(q)) return false
      return true
    })
  }, [kunde.aufgaben, filter, suche, rolle])

  const zaehler = useMemo(
    () => ({
      offen: kunde.aufgaben.filter((a) => a.status === 'offen').length,
      arbeit: kunde.aufgaben.filter((a) => a.status === 'in-arbeit').length,
      erledigt: kunde.aufgaben.filter((a) => a.status === 'erledigt').length,
      ueberfaellig: kunde.aufgaben.filter((a) => faelligkeit(a).ueberfaellig).length,
    }),
    [kunde.aufgaben],
  )

  const weiter = (aufgabe) => {
    if (!schreibbar) return
    const naechster = naechsterStatus(aufgabe.status)
    setAufgabeStatus(kunde.id, aufgabe.id, naechster)
    toast.show({
      title: `Aufgabe: ${STATUS[naechster].label}`,
      description: aufgabe.titel,
      variant: naechster === 'erledigt' ? 'success' : 'info',
    })
  }

  return (
    <div className="space-y-5">
      {zaehler.ueberfaellig > 0 ? (
        <Banner toneName="urgent" icon={IconClock} title="Überfällige Aufgaben">
          {zaehler.ueberfaellig}{' '}
          {zaehler.ueberfaellig === 1 ? 'Aufgabe ist' : 'Aufgaben sind'} über den Fälligkeitstermin
          hinaus. Sie blockieren die nachfolgenden Schritte im 90-Tage-Plan.
        </Banner>
      ) : null}

      <Card>
        <CardBody className="space-y-4">
          <StatusSplit
            segments={[
              { label: 'Offen', value: zaehler.offen, tone: 'neutral' },
              { label: 'In Arbeit', value: zaehler.arbeit, tone: 'info' },
              { label: 'Erledigt', value: zaehler.erledigt, tone: 'ok' },
            ]}
          />
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Aufgaben filtern"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'alle', label: 'Alle', count: kunde.aufgaben.length },
              { value: 'offen', label: 'Offen', count: zaehler.offen + zaehler.arbeit },
              { value: 'meine', label: rolle === 'kunde' ? 'Bei uns' : 'Bei SYMMEDIS', icon: IconUser },
              ...(zaehler.ueberfaellig
                ? [{ value: 'ueberfaellig', label: 'Überfällig', count: zaehler.ueberfaellig }]
                : []),
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Aufgabe suchen …"
            label="Aufgaben durchsuchen"
            className="flex-1 sm:w-56"
          />
          <Segmented
            label="Ansicht wählen"
            value={ansicht}
            onChange={setAnsicht}
            options={[
              { value: 'liste', label: 'Liste', icon: IconList },
              { value: 'board', label: 'Board', icon: IconKanban },
            ]}
            className="hidden md:inline-flex"
          />
        </div>
      </div>

      {gefiltert.length === 0 ? (
        <Card>
          <EmptyState
            icon={IconCheckSquare}
            title="Keine Aufgaben in dieser Auswahl"
            description="Setzen Sie den Filter zurück, um alle Aufgaben des Projekts zu sehen."
            action={
              <Button variant="secondary" size="sm" onClick={() => { setFilter('alle'); setSuche('') }}>
                Filter zurücksetzen
              </Button>
            }
          />
        </Card>
      ) : ansicht === 'board' ? (
        <div className="hidden gap-4 md:grid md:grid-cols-3">
          {SPALTEN.map((spalte) => {
            const eintraege = gefiltert.filter((a) => a.status === spalte.id)
            return (
              <div key={spalte.id} className="rounded-card border border-line bg-surface-muted p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[0.8125rem] font-semibold text-ink">{spalte.label}</p>
                  <span className="tabular text-xs text-ink-3">{eintraege.length}</span>
                </div>
                <ul className="space-y-2.5">
                  {eintraege.map((aufgabe) => (
                    <li key={aufgabe.id}>
                      <AufgabenKarte aufgabe={aufgabe} onWeiter={schreibbar ? weiter : undefined} />
                    </li>
                  ))}
                  {eintraege.length === 0 ? (
                    <li className="rounded-lg border border-dashed border-line-strong px-3 py-6 text-center text-xs text-ink-3">
                      Keine Aufgaben
                    </li>
                  ) : null}
                </ul>
              </div>
            )
          })}
        </div>
      ) : null}

      {/* Liste – auf Mobile immer, da das Board horizontal nicht funktioniert */}
      <Card className={cn(ansicht === 'board' && 'md:hidden')}>
        <CardHeader
          title="Aufgabenliste"
          subtitle={`${gefiltert.length} von ${kunde.aufgaben.length} Aufgaben`}
        />
        <CardBody className="px-0 py-0">
          <ul className="divide-y divide-line">
            {gefiltert.map((aufgabe) => {
              const faellt = faelligkeit(aufgabe)
              const prio = PRIORITAETEN[aufgabe.prioritaet]
              return (
                <li key={aufgabe.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
                  <button
                    type="button"
                    disabled={!schreibbar}
                    onClick={() => weiter(aufgabe)}
                    aria-label={
                      aufgabe.status === 'erledigt'
                        ? `${aufgabe.titel} wieder öffnen`
                        : `${aufgabe.titel} weiterschalten`
                    }
                    className={cn(
                      'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
                      aufgabe.status === 'erledigt'
                        ? 'border-ok-ink bg-ok-ink text-on-solid'
                        : aufgabe.status === 'in-arbeit'
                          ? 'border-info bg-info-soft text-info-ink'
                          : 'border-line-strong text-transparent hover:border-brand',
                      !schreibbar && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    {aufgabe.status === 'erledigt' ? (
                      <IconCheck className="size-3.5" />
                    ) : aufgabe.status === 'in-arbeit' ? (
                      <span className="size-2 rounded-full bg-info" />
                    ) : null}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-[0.875rem] leading-snug font-medium',
                        aufgabe.status === 'erledigt' ? 'text-ink-3 line-through' : 'text-ink',
                      )}
                    >
                      {aufgabe.titel}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Chip size="sm" toneName={prio.tone}>
                        {prio.label}
                      </Chip>
                      <Chip
                        size="sm"
                        toneName={faellt.tone}
                        icon={faellt.ueberfaellig ? IconClock : undefined}
                      >
                        {faellt.label}
                      </Chip>
                      <Chip
                        size="sm"
                        toneName={aufgabe.verantwortlich === 'kunde' ? 'brand' : 'accent'}
                        icon={aufgabe.verantwortlich === 'kunde' ? IconUser : IconUsers}
                      >
                        {aufgabe.verantwortlich === 'kunde' ? 'Kunde' : 'SYMMEDIS'}
                      </Chip>
                      <span className="text-xs text-ink-3">
                        {KATEGORIE_MAP[aufgabe.kategorieId]?.label} · Messgröße: {aufgabe.kpi}
                      </span>
                    </div>
                  </div>

                  <span className="hidden shrink-0 text-xs text-ink-3 lg:block">
                    {aufgabe.zustaendig}
                  </span>
                </li>
              )
            })}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}

function AufgabenKarte({ aufgabe, onWeiter }) {
  const faellt = faelligkeit(aufgabe)
  const prio = PRIORITAETEN[aufgabe.prioritaet]

  return (
    <div className="rounded-lg border border-line bg-surface p-3 shadow-xs">
      <p className="text-[0.8125rem] leading-snug font-medium text-ink">{aufgabe.titel}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Chip size="sm" toneName={prio.tone}>
          {prio.label}
        </Chip>
        <Chip size="sm" toneName={faellt.tone}>
          {faellt.label}
        </Chip>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5">
        <span className="truncate text-xs text-ink-3">{aufgabe.zustaendig}</span>
        {onWeiter ? (
          <Button variant="ghost" size="xs" onClick={() => onWeiter(aufgabe)}>
            {aufgabe.status === 'erledigt' ? 'Öffnen' : 'Weiter'}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

/** Kompakte Aufgabenliste für Dashboards. */
export function AufgabenVorschau({ kunde, anzahl = 4, nurRolle, onAlle }) {
  const offen = kunde.aufgaben
    .filter((a) => a.status !== 'erledigt')
    .filter((a) => !nurRolle || a.verantwortlich === nurRolle)
    .sort((a, b) => tageBis(a.faellig) - tageBis(b.faellig))
    .slice(0, anzahl)

  return (
    <Card>
      <CardHeader
        title="Nächste Aufgaben"
        subtitle={nurRolle === 'kunde' ? 'In Ihrer Verantwortung' : 'Nach Fälligkeit'}
        icon={IconCheckSquare}
        action={
          onAlle ? (
            <Button variant="ghost" size="sm" onClick={onAlle}>
              Alle
            </Button>
          ) : null
        }
      />
      <CardBody className="px-0 py-0">
        {offen.length === 0 ? (
          <EmptyState
            compact
            icon={IconCheck}
            title="Nichts offen"
            description="Alle Aufgaben in diesem Bereich sind erledigt."
          />
        ) : (
          <ul className="divide-y divide-line">
            {offen.map((aufgabe) => {
              const faellt = faelligkeit(aufgabe)
              return (
                <li key={aufgabe.id} className="flex items-start gap-3 px-4 py-3 sm:px-5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-1.5 size-2 shrink-0 rounded-full',
                      faellt.ueberfaellig ? 'bg-urgent' : 'bg-neutral',
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.8125rem] leading-snug font-medium text-ink">
                      {aufgabe.titel}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-3">
                      {faellt.label} · {aufgabe.zustaendig}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
