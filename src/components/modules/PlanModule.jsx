import { cn } from '../../lib/cn.js'
import { KATEGORIE_MAP } from '../../data/catalog.js'
import { faelligkeit } from '../../lib/aufgaben.js'
import { PRIORITAETEN } from '../../lib/tone.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, Banner } from '../ui/layout.jsx'
import { ProgressBar } from '../ui/data.jsx'
import { IconCheck, IconRoute, IconTarget, IconUser, IconUsers } from '../ui/Icons.jsx'

/**
 * 90-Tage-Plan.
 *
 * Drei Phasen mit jeweils eigenem Ziel. Der Plan ist die Brücke zwischen
 * Analyseergebnis und Umsetzung – jede Aufgabe verweist auf die
 * Analysedimension, aus der sie stammt.
 */
export function PlanModule({ kunde, rolle = 'kunde', onAufgaben }) {
  const gesamt = kunde.aufgaben.length
  const erledigt = kunde.aufgaben.filter((a) => a.status === 'erledigt').length
  const fortschritt = gesamt ? Math.round((erledigt / gesamt) * 100) : 0

  return (
    <div className="space-y-5">
      <Banner toneName="brand" icon={IconRoute} title="Wie der Plan entsteht">
        Die Software leitet aus den drei größten Umsatzbremsen einen Vorschlag ab. Reihenfolge,
        Zuständigkeit und Messgrößen legt das SYMMEDIS-Team gemeinsam mit Ihnen fest –
        automatisch freigegeben wird nichts.
      </Banner>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Umsetzungsfortschritt</p>
              <p className="mt-0.5 text-[0.8125rem] text-ink-2">
                {erledigt} von {gesamt} Maßnahmen abgeschlossen
              </p>
            </div>
            {onAufgaben ? (
              <Button variant="secondary" size="sm" onClick={onAufgaben}>
                Zur Aufgabenverwaltung
              </Button>
            ) : null}
          </div>
          <ProgressBar
            value={fortschritt}
            showValue
            className="mt-4"
            label="Über alle drei Phasen"
            toneName={fortschritt >= 66 ? 'ok' : fortschritt >= 33 ? 'info' : 'neutral'}
          />
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {kunde.plan.map((phase, index) => {
          const phaseErledigt = phase.aufgaben.filter((a) => a.status === 'erledigt').length
          const abgeschlossen = phaseErledigt === phase.aufgaben.length && phase.aufgaben.length > 0
          const laufend = !abgeschlossen && (index === 0 || kunde.plan[index - 1].aufgaben.every((a) => a.status === 'erledigt'))

          return (
            <Card key={phase.id} className="flex flex-col">
              <CardHeader
                title={phase.label}
                subtitle={phase.ziel}
                icon={IconTarget}
                action={
                  <Chip
                    size="sm"
                    toneName={abgeschlossen ? 'ok' : laufend ? 'info' : 'neutral'}
                    icon={abgeschlossen ? IconCheck : undefined}
                  >
                    {abgeschlossen ? 'Abgeschlossen' : laufend ? 'Laufend' : 'Geplant'}
                  </Chip>
                }
              />
              <CardBody className="flex-1 px-0 py-0">
                <div className="px-4 pt-3.5 sm:px-5">
                  <ProgressBar
                    value={phase.aufgaben.length ? (phaseErledigt / phase.aufgaben.length) * 100 : 0}
                    size="sm"
                    toneName={abgeschlossen ? 'ok' : 'brand'}
                    label={`${phaseErledigt} von ${phase.aufgaben.length} Maßnahmen`}
                  />
                </div>
                <ol className="mt-3 divide-y divide-line border-t border-line">
                  {phase.aufgaben.map((aufgabe) => {
                    const faellt = faelligkeit(aufgabe)
                    return (
                      <li key={aufgabe.id} className="flex items-start gap-2.5 px-4 py-3 sm:px-5">
                        <span
                          className={cn(
                            'mt-0.5 inline-flex size-4.5 shrink-0 items-center justify-center rounded-full border',
                            aufgabe.status === 'erledigt'
                              ? 'border-ok-ink bg-ok-ink text-on-solid'
                              : aufgabe.status === 'in-arbeit'
                                ? 'border-info bg-info-soft'
                                : 'border-line-strong',
                          )}
                        >
                          {aufgabe.status === 'erledigt' ? <IconCheck className="size-3" /> : null}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'text-[0.8125rem] leading-snug',
                              aufgabe.status === 'erledigt' ? 'text-ink-3 line-through' : 'text-ink',
                            )}
                          >
                            {aufgabe.titel}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <Chip
                              size="sm"
                              toneName={aufgabe.verantwortlich === 'kunde' ? 'brand' : 'accent'}
                              icon={aufgabe.verantwortlich === 'kunde' ? IconUser : IconUsers}
                            >
                              {aufgabe.verantwortlich === 'kunde' ? 'Kunde' : 'SYMMEDIS'}
                            </Chip>
                            <Chip size="sm" toneName={PRIORITAETEN[aufgabe.prioritaet].tone}>
                              {PRIORITAETEN[aufgabe.prioritaet].label}
                            </Chip>
                          </div>
                          <p className="mt-1.5 text-xs text-ink-3">
                            {faellt.label} · Messgröße: {aufgabe.kpi}
                          </p>
                          {rolle !== 'kunde' ? (
                            <p className="mt-0.5 text-xs text-ink-3">
                              Wirkt auf: {KATEGORIE_MAP[aufgabe.kategorieId]?.label}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </CardBody>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader title="Woraus der Plan abgeleitet ist" subtitle="Die drei größten Umsatzbremsen" />
        <CardBody className="px-0 py-0">
          <ol className="divide-y divide-line">
            {kunde.bremsen.map((bremse) => (
              <li key={bremse.id} className="flex items-start gap-3.5 px-4 py-4 sm:px-5">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-inverse text-xs font-semibold text-canvas">
                  {bremse.rang}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.875rem] font-semibold text-ink">{bremse.titel}</p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-2">{bremse.ursache}</p>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink">
                    <span className="font-medium">Daraus folgt: </span>
                    {bremse.naechsteAktion}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  )
}

/** Kompakte Plan-Kachel für Dashboards. */
export function PlanVorschau({ kunde, onOeffnen }) {
  return (
    <Card>
      <CardHeader
        title="90-Tage-Plan"
        subtitle="Drei Phasen von der Ursache zur Nachfrage"
        icon={IconRoute}
        action={
          onOeffnen ? (
            <Button variant="ghost" size="sm" onClick={onOeffnen}>
              Ansehen
            </Button>
          ) : null
        }
      />
      <CardBody className="space-y-4">
        {kunde.plan.map((phase) => {
          const erledigt = phase.aufgaben.filter((a) => a.status === 'erledigt').length
          return (
            <div key={phase.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.8125rem] font-medium text-ink">{phase.label}</span>
                <span className="tabular text-xs text-ink-3">
                  {erledigt}/{phase.aufgaben.length}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-3">{phase.ziel}</p>
              <ProgressBar
                value={phase.aufgaben.length ? (erledigt / phase.aufgaben.length) * 100 : 0}
                size="sm"
                className="mt-1.5"
                toneName={erledigt === phase.aufgaben.length ? 'ok' : 'brand'}
                hideLabel
                label={`${phase.label}: ${erledigt} von ${phase.aufgaben.length}`}
              />
            </div>
          )
        })}
      </CardBody>
    </Card>
  )
}
