import { useState } from 'react'
import { cn } from '../../lib/cn.js'
import { KATEGORIE_MAP } from '../../data/catalog.js'
import { faelligkeit } from '../../lib/aufgaben.js'
import { PRIORITAETEN } from '../../lib/tone.js'
import { generate90DayPlan } from '../../lib/workspaceApi.js'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, Banner, EmptyState } from '../ui/layout.jsx'
import { ProgressBar } from '../ui/data.jsx'
import { IconCheck, IconRoute, IconTarget, IconUser, IconUsers } from '../ui/Icons.jsx'

const STANDARD_PRIORITAET = { label: 'Nicht klassifiziert', tone: 'neutral' }

function prioritaetInfo(key) {
  return PRIORITAETEN[key] || STANDARD_PRIORITAET
}

export function PlanModule({ kunde, rolle = 'kunde', onAufgaben }) {
  const { accessToken, echteAuthentifizierung } = useSession()
  const { neuLaden } = useWorkspace()
  const toast = useToast()
  const [generiert, setGeneriert] = useState(false)
  const gesamt = kunde.aufgaben.length
  const erledigt = kunde.aufgaben.filter((a) => a.status === 'erledigt').length
  const fortschritt = gesamt ? Math.round((erledigt / gesamt) * 100) : 0
  const hatPlan = kunde.plan.some((phase) => phase.aufgaben.length > 0)

  const planErzeugen = async () => {
    if (!echteAuthentifizierung || !accessToken) {
      toast.show({ title: 'Im Demo-Modus nicht gespeichert', description: 'Der echte 90-Tage-Plan wird aus den Projektfindings im Backend erzeugt.' })
      return
    }
    if (kunde.analyse.length === 0) {
      toast.show({ title: 'Noch keine Analyse vorhanden', description: 'Starten und prüfen Sie zuerst die Ursachenanalyse.' })
      return
    }
    setGeneriert(true)
    try {
      const result = await generate90DayPlan(accessToken, kunde.projectId)
      await neuLaden()
      const count = typeof result === 'number' ? result : Number(result || 0)
      toast.show({ title: '90-Tage-Plan aktualisiert', description: `${count} Maßnahmen wurden aus den priorisierten Empfehlungen abgeleitet bzw. aktualisiert.`, variant: 'success' })
    } catch (error) {
      toast.show({ title: 'Plan konnte nicht erzeugt werden', description: error instanceof Error ? error.message : 'Unbekannter Fehler', variant: 'danger' })
    } finally {
      setGeneriert(false)
    }
  }

  return (
    <div className="space-y-5">
      <Banner toneName="brand" icon={IconRoute} title="Wie der Plan entsteht">
        Die Software priorisiert die stärksten Hebel aus der Ursachenanalyse und erzeugt daraus einen 30/60/90-Tage-Vorschlag. Zuständigkeit und Messgrößen bleiben unter menschlicher Kontrolle – automatisch für den Kunden freigegeben wird nichts.
      </Banner>

      {rolle === 'intern' ? (
        <Card>
          <CardBody>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">Plan aus Analyse synchronisieren</p>
                <p className="mt-0.5 text-[0.8125rem] text-ink-2">Bis zu sechs priorisierte Empfehlungen werden auf drei Umsetzungsphasen verteilt. Wiederholtes Ausführen aktualisiert statt zu duplizieren.</p>
              </div>
              <Button size="sm" onClick={planErzeugen} disabled={generiert}>{generiert ? 'Erzeugt …' : hatPlan ? 'Plan aktualisieren' : '90-Tage-Plan erzeugen'}</Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {!hatPlan ? (
        <Card>
          <EmptyState
            icon={IconRoute}
            title={rolle === 'kunde' ? 'Ihr 90-Tage-Plan wird vorbereitet' : 'Noch kein 90-Tage-Plan vorhanden'}
            description={rolle === 'kunde'
              ? 'Sobald die priorisierten Analyseergebnisse geprüft und in Maßnahmen übersetzt sind, erscheinen hier Ihre nächsten Schritte für die ersten 90 Tage.'
              : 'Erzeugen Sie den Plan aus den geprüften Analyseempfehlungen. Danach stehen Maßnahmen, Zuständigkeiten, Fälligkeiten und Messgrößen strukturiert bereit.'}
            action={rolle === 'intern' ? <Button size="sm" onClick={planErzeugen} disabled={generiert}>{generiert ? 'Erzeugt …' : 'Plan jetzt erzeugen'}</Button> : undefined}
          />
        </Card>
      ) : (
        <>
          <Card>
            <CardBody>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-semibold text-ink">Umsetzungsfortschritt</p><p className="mt-0.5 text-[0.8125rem] text-ink-2">{erledigt} von {gesamt} Maßnahmen abgeschlossen</p></div>
                {onAufgaben ? <Button variant="secondary" size="sm" onClick={onAufgaben}>Zur Aufgabenverwaltung</Button> : null}
              </div>
              <ProgressBar value={fortschritt} showValue className="mt-4" label="Über alle drei Phasen" toneName={fortschritt >= 66 ? 'ok' : fortschritt >= 33 ? 'info' : 'neutral'} />
            </CardBody>
          </Card>

          <div className="grid gap-5 lg:grid-cols-3">
            {kunde.plan.map((phase, index) => {
              const phaseErledigt = phase.aufgaben.filter((a) => a.status === 'erledigt').length
              const abgeschlossen = phaseErledigt === phase.aufgaben.length && phase.aufgaben.length > 0
              const laufend = !abgeschlossen && phase.aufgaben.length > 0 && (index === 0 || kunde.plan[index - 1].aufgaben.every((a) => a.status === 'erledigt'))
              return (
                <Card key={phase.id} className="flex flex-col">
                  <CardHeader title={phase.label} subtitle={phase.ziel} icon={IconTarget} action={<Chip size="sm" toneName={abgeschlossen ? 'ok' : laufend ? 'info' : 'neutral'} icon={abgeschlossen ? IconCheck : undefined}>{abgeschlossen ? 'Abgeschlossen' : laufend ? 'Laufend' : 'Geplant'}</Chip>} />
                  <CardBody className="flex-1 px-0 py-0">
                    <div className="px-4 pt-3.5 sm:px-5"><ProgressBar value={phase.aufgaben.length ? (phaseErledigt / phase.aufgaben.length) * 100 : 0} size="sm" toneName={abgeschlossen ? 'ok' : 'brand'} label={`${phaseErledigt} von ${phase.aufgaben.length} Maßnahmen`} /></div>
                    {phase.aufgaben.length ? (
                      <ol className="mt-3 divide-y divide-line border-t border-line">
                        {phase.aufgaben.map((aufgabe) => {
                          const faellt = faelligkeit(aufgabe)
                          const prio = prioritaetInfo(aufgabe.prioritaet)
                          return (
                            <li key={aufgabe.id} className="flex items-start gap-2.5 px-4 py-3 sm:px-5">
                              <span className={cn('mt-0.5 inline-flex size-4.5 shrink-0 items-center justify-center rounded-full border', aufgabe.status === 'erledigt' ? 'border-ok-ink bg-ok-ink text-on-solid' : aufgabe.status === 'in-arbeit' ? 'border-info bg-info-soft' : 'border-line-strong')}>{aufgabe.status === 'erledigt' ? <IconCheck className="size-3" /> : null}</span>
                              <div className="min-w-0 flex-1">
                                <p className={cn('text-[0.8125rem] leading-snug', aufgabe.status === 'erledigt' ? 'text-ink-3 line-through' : 'text-ink')}>{aufgabe.titel}</p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                  <Chip size="sm" toneName={aufgabe.verantwortlich === 'kunde' ? 'brand' : 'accent'} icon={aufgabe.verantwortlich === 'kunde' ? IconUser : IconUsers}>{aufgabe.verantwortlich === 'kunde' ? 'Kunde' : 'SYMMEDIS'}</Chip>
                                  <Chip size="sm" toneName={prio.tone}>{prio.label}</Chip>
                                </div>
                                <p className="mt-1.5 text-xs text-ink-3">{faellt.label}{aufgabe.kpi ? ` · Messgröße: ${aufgabe.kpi}` : ''}</p>
                                {rolle !== 'kunde' ? <p className="mt-0.5 text-xs text-ink-3">Wirkt auf: {KATEGORIE_MAP[aufgabe.kategorieId]?.label || aufgabe.kategorieId || 'Nicht zugeordnet'}</p> : null}
                              </div>
                            </li>
                          )
                        })}
                      </ol>
                    ) : <p className="px-4 py-5 text-xs leading-relaxed text-ink-3 sm:px-5">Für diese Phase sind noch keine Maßnahmen terminiert.</p>}
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <Card>
        <CardHeader title="Woraus der Plan abgeleitet ist" subtitle="Die drei größten Umsatzbremsen" />
        <CardBody className="px-0 py-0">
          {kunde.bremsen.length ? (
            <ol className="divide-y divide-line">
              {kunde.bremsen.map((bremse) => <li key={bremse.id} className="flex items-start gap-3.5 px-4 py-4 sm:px-5"><span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-inverse text-xs font-semibold text-canvas">{bremse.rang}</span><div className="min-w-0 flex-1"><p className="text-[0.875rem] font-semibold text-ink">{bremse.titel}</p><p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-2">{bremse.ursache}</p><p className="mt-2 text-[0.8125rem] leading-relaxed text-ink"><span className="font-medium">Daraus folgt: </span>{bremse.naechsteAktion}</p></div></li>)}
            </ol>
          ) : <EmptyState compact icon={IconTarget} title="Umsatzbremsen noch nicht priorisiert" description="Die Ableitung erscheint hier, sobald die Ursachenanalyse geprüft und die stärksten Hebel priorisiert wurden." />}
        </CardBody>
      </Card>
    </div>
  )
}

export function PlanVorschau({ kunde, onOeffnen }) {
  const hatPlan = kunde.plan.some((phase) => phase.aufgaben.length > 0)
  return (
    <Card>
      <CardHeader title="90-Tage-Plan" subtitle="Drei Phasen von der Ursache zur Nachfrage" icon={IconRoute} action={onOeffnen ? <Button variant="ghost" size="sm" onClick={onOeffnen}>Ansehen</Button> : null} />
      <CardBody className="space-y-4">
        {hatPlan ? kunde.plan.map((phase) => {
          const erledigt = phase.aufgaben.filter((a) => a.status === 'erledigt').length
          return <div key={phase.id}><div className="flex items-baseline justify-between gap-3"><span className="text-[0.8125rem] font-medium text-ink">{phase.label}</span><span className="tabular text-xs text-ink-3">{erledigt}/{phase.aufgaben.length}</span></div><p className="mt-0.5 text-xs text-ink-3">{phase.ziel}</p><ProgressBar value={phase.aufgaben.length ? (erledigt / phase.aufgaben.length) * 100 : 0} size="sm" className="mt-1.5" toneName={erledigt === phase.aufgaben.length && phase.aufgaben.length ? 'ok' : 'brand'} hideLabel label={`${phase.label}: ${erledigt} von ${phase.aufgaben.length}`} /></div>
        }) : <p className="text-[0.8125rem] leading-relaxed text-ink-2">Der Umsetzungsplan erscheint hier, sobald die priorisierten Analyseergebnisse in konkrete Maßnahmen übersetzt wurden.</p>}
      </CardBody>
    </Card>
  )
}
