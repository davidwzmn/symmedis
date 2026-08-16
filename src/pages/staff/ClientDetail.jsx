import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useToast } from '../../hooks/useToast.js'
import { PROJEKT_STATUS, TEAM_MAP } from '../../data/workspace.js'
import { formatDate, formatNumber } from '../../lib/format.js'
import { FREIGABE, scoreStufe } from '../../lib/tone.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader, PageHeader, MetricCard } from '../../components/ui/layout.jsx'
import { Tabs, KeyValueList, ProgressBar } from '../../components/ui/data.jsx'
import { Breadcrumb } from '../../components/shell/Topbar.jsx'
import { AnalysisModule, BremsenCards } from '../../components/modules/AnalysisModule.jsx'
import { AnalysisRunPanel } from '../../components/modules/AnalysisRunPanel.jsx'
import { AccessInviteCard } from '../../components/modules/AccessInviteCard.jsx'
import { SocialModule } from '../../components/modules/SocialModule.jsx'
import { CompetitionModule } from '../../components/modules/CompetitionModule.jsx'
import { PlanModule } from '../../components/modules/PlanModule.jsx'
import { TasksModule } from '../../components/modules/TasksModule.jsx'
import { DocumentsModule } from '../../components/modules/DocumentsModule.jsx'
import { ReportsModule } from '../../components/modules/ReportsModule.jsx'
import { AppointmentsModule } from '../../components/modules/AppointmentsModule.jsx'
import { ChatModule } from '../../components/modules/ChatModule.jsx'
import { ActivityFeed } from '../../components/modules/ActivityFeed.jsx'
import { InternalNotes } from '../../components/modules/InternalNotes.jsx'
import {
  IconAlert,
  IconCalendar,
  IconChart,
  IconChat,
  IconCheckSquare,
  IconDocument,
  IconFolder,
  IconGrid,
  IconHistory,
  IconLayers,
  IconLock,
  IconMail,
  IconRoute,
  IconShare,
  IconShield,
  IconTarget,
} from '../../components/ui/Icons.jsx'

const TABS = [
  { id: 'ueberblick', label: 'Überblick', icon: IconGrid },
  { id: 'analyse', label: 'Analyse', icon: IconChart },
  { id: 'social', label: 'Social', icon: IconShare },
  { id: 'wettbewerb', label: 'Wettbewerb', icon: IconLayers },
  { id: 'plan', label: '90-Tage-Plan', icon: IconRoute },
  { id: 'aufgaben', label: 'Aufgaben', icon: IconCheckSquare },
  { id: 'dokumente', label: 'Dokumente', icon: IconFolder },
  { id: 'berichte', label: 'Berichte', icon: IconDocument },
  { id: 'termine', label: 'Termine', icon: IconCalendar },
  { id: 'nachrichten', label: 'Nachrichten', icon: IconChat },
  { id: 'notizen', label: 'Interne Notizen', icon: IconLock },
  { id: 'verlauf', label: 'Verlauf', icon: IconHistory },
]

export function ClientDetail() {
  const { kundeId } = useParams()
  const { getKunde, freigebenAlle, addAktivitaet } = useWorkspace()
  const toast = useToast()
  const [tab, setTab] = useState('ueberblick')

  const kunde = getKunde(kundeId)
  if (!kunde) return <Navigate to="/intern/kunden" replace />

  const status = PROJEKT_STATUS[kunde.status] || PROJEKT_STATUS.onboarding
  const betreuer = TEAM_MAP[kunde.betreuerId]?.name || 'Nicht zugewiesen'
  const offeneFreigaben = kunde.analyse.filter((a) => a.freigabe === 'bearbeitet' || a.freigabe === 'intern').length

  const alleFreigeben = () => {
    const anzahl = freigebenAlle(kunde.id)
    if (anzahl === 0) {
      toast.show({ title: 'Nichts freizugeben', description: 'Kein Punkt ist geprüft und offen.' })
      return
    }
    addAktivitaet(kunde.id, { titel: `${anzahl} Analysepunkte für den Kunden freigegeben`, actor: 'SYMMEDIS', tone: 'ok' })
    toast.show({ title: `${anzahl} Punkte freigegeben`, description: 'Sie sind ab sofort im Kundenportal sichtbar.', variant: 'success' })
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Kunden', to: '/intern/kunden' }, { label: kunde.unternehmen }]} />

      <PageHeader
        title={kunde.unternehmen}
        subtitle={`${kunde.branche || 'Branche offen'} · ${kunde.ort || 'Ort offen'} · ${formatNumber(kunde.mitarbeitende || 0)} Mitarbeitende · Betreuung ${betreuer}`}
        meta={
          <>
            <Chip toneName={status.tone} dot>{status.label}</Chip>
            <Chip toneName={scoreStufe(kunde.gesamtScore).tone}>Reifegrad {kunde.gesamtScore}</Chip>
            {offeneFreigaben > 0 ? (
              <Chip toneName="warn" icon={IconShield}>{offeneFreigaben} Freigaben offen</Chip>
            ) : kunde.analyse.length > 0 ? (
              <Chip toneName="ok" icon={IconShield}>Keine geprüften Freigaben offen</Chip>
            ) : (
              <Chip toneName="neutral" icon={IconShield}>Analyse noch nicht gestartet</Chip>
            )}
          </>
        }
        actions={
          <>
            <Button as={Link} to="/intern/freigaben" variant="secondary" size="sm">Freigabezentrum</Button>
            <Button size="sm" onClick={alleFreigeben} disabled={offeneFreigaben === 0}>
              <IconShield className="size-4" />Geprüfte Punkte freigeben
            </Button>
          </>
        }
      />

      <Tabs items={TABS} value={tab} onChange={setTab} label="Bereich der Kundenakte" />

      {tab === 'ueberblick' ? <Ueberblick kunde={kunde} /> : null}
      {tab === 'analyse' ? <div className="space-y-5"><AnalysisRunPanel kunde={kunde} /><AnalysisModule kunde={kunde} rolle="intern" /></div> : null}
      {tab === 'social' ? <SocialModule kunde={kunde} rolle="intern" /> : null}
      {tab === 'wettbewerb' ? <CompetitionModule kunde={kunde} /> : null}
      {tab === 'plan' ? <PlanModule kunde={kunde} rolle="intern" /> : null}
      {tab === 'aufgaben' ? <TasksModule kunde={kunde} rolle="intern" /> : null}
      {tab === 'dokumente' ? <DocumentsModule kunde={kunde} rolle="intern" /> : null}
      {tab === 'berichte' ? <ReportsModule kunde={kunde} rolle="intern" /> : null}
      {tab === 'termine' ? <AppointmentsModule kunde={kunde} /> : null}
      {tab === 'nachrichten' ? <ChatModule kunde={kunde} rolle="intern" /> : null}
      {tab === 'notizen' ? <InternalNotes kunde={kunde} /> : null}
      {tab === 'verlauf' ? <ActivityFeed kunde={kunde} titel="Prüfpfad" alsPruefpfad /> : null}
    </div>
  )
}

function Ueberblick({ kunde }) {
  const freigegeben = kunde.analyse.filter((a) => a.sichtbarKunde).length
  const offeneAufgaben = kunde.aufgaben.filter((a) => a.status !== 'erledigt').length
  const freigabeProzent = kunde.analyse.length ? (freigegeben / kunde.analyse.length) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Gesamtreifegrad" value={kunde.gesamtScore} unit="/ 100" icon={IconTarget} toneName={scoreStufe(kunde.gesamtScore).tone} hint={kunde.analyse.length ? scoreStufe(kunde.gesamtScore).label : 'Noch nicht analysiert'} />
        <MetricCard
          label="Für Kunden freigegeben" value={`${freigegeben}/${kunde.analyse.length}`} icon={IconShield}
          toneName={kunde.analyse.length > 0 && freigegeben === kunde.analyse.length ? 'ok' : 'warn'} hint="Analysedimensionen"
          footer={<ProgressBar value={freigabeProzent} size="sm" hideLabel label="Freigabefortschritt" />}
        />
        <MetricCard label="Offene Aufgaben" value={offeneAufgaben} icon={IconCheckSquare} toneName={offeneAufgaben > 5 ? 'warn' : 'neutral'} hint={`${kunde.aufgaben.length} insgesamt`} />
        <MetricCard label="Social-Reife" value={kunde.social.gesamt} unit="/ 100" icon={IconShare} toneName={scoreStufe(kunde.social.gesamt).tone} hint={`${kunde.social.plattformen.filter((p) => p.verbunden).length} Kanäle ausgewertet`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          <section>
            <h2 className="mb-3 text-base font-semibold text-ink">Die drei größten Umsatzbremsen</h2>
            <BremsenCards kunde={kunde} />
          </section>

          <Card>
            <CardHeader title="Freigabestand je Dimension" subtitle="Automatisch vorgeschlagen → in Prüfung → bearbeitet → intern → Kunde" icon={IconShield} />
            <CardBody className="space-y-2.5">
              {Object.entries(FREIGABE).map(([key, wert]) => {
                const anzahl = kunde.analyse.filter((a) => a.freigabe === key).length
                return (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <Chip size="sm" toneName={wert.tone}>{wert.label}</Chip>
                    <span className="tabular text-[0.8125rem] font-semibold text-ink">{anzahl}</span>
                  </div>
                )
              })}
            </CardBody>
          </Card>
        </div>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Stammdaten" icon={IconMail} />
            <CardBody>
              <KeyValueList items={[
                { label: 'Ansprechpartner', value: kunde.ansprechpartner?.name || '–' },
                { label: 'Funktion', value: kunde.ansprechpartner?.rolle || '–' },
                { label: 'E-Mail', value: kunde.ansprechpartner?.email || '–' },
                { label: 'Telefon', value: kunde.ansprechpartner?.telefon || '–' },
                { label: 'Analysestart', value: kunde.start ? formatDate(kunde.start) : '–' },
                { label: 'Ergebnistermin', value: kunde.ergebnis ? formatDate(kunde.ergebnis) : '–' },
              ]} />
            </CardBody>
          </Card>

          <AccessInviteCard kunde={kunde} />

          <Card className="border-warn-border">
            <CardHeader title="Interne Notizen" subtitle="Nicht im Kundenportal sichtbar" icon={IconLock} />
            <CardBody className="space-y-3">
              {kunde.notizenIntern.slice(0, 2).map((notiz) => (
                <div key={notiz.id} className="rounded-lg border border-line bg-surface-muted p-3">
                  <p className="text-[0.8125rem] leading-relaxed text-ink">{notiz.text}</p>
                  <p className="mt-1.5 text-xs text-ink-3">{notiz.autor}</p>
                </div>
              ))}
              {kunde.notizenIntern.length === 0 ? <p className="text-xs text-ink-3">Noch keine internen Notizen.</p> : null}
              <p className="flex items-start gap-2 text-xs text-ink-3"><IconAlert className="mt-0.5 size-3.5 shrink-0" />Vollständige Liste im Register „Interne Notizen“.</p>
            </CardBody>
          </Card>

          <ActivityFeed kunde={kunde} titel="Letzte Schritte" limit={5} />
        </div>
      </div>
    </div>
  )
}
