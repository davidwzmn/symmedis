import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useSession } from '../../hooks/useSession.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { AppShell } from '../../components/shell/AppShell.jsx'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { PageHeader, Card, CardBody, CardHeader, Banner } from '../../components/ui/layout.jsx'
import { KeyValueList } from '../../components/ui/data.jsx'
import { ProjectDashboard } from '../../components/modules/ProjectDashboard.jsx'
import { AnalysisModule, BremsenCards } from '../../components/modules/AnalysisModule.jsx'
import { SocialModule } from '../../components/modules/SocialModule.jsx'
import { CompetitionModule } from '../../components/modules/CompetitionModule.jsx'
import { PlanModule } from '../../components/modules/PlanModule.jsx'
import { TasksModule } from '../../components/modules/TasksModule.jsx'
import { DocumentsModule } from '../../components/modules/DocumentsModule.jsx'
import { ReportsModule } from '../../components/modules/ReportsModule.jsx'
import { AppointmentsModule } from '../../components/modules/AppointmentsModule.jsx'
import { ChatModule } from '../../components/modules/ChatModule.jsx'
import { ActivityFeed } from '../../components/modules/ActivityFeed.jsx'
import { formatDate } from '../../lib/format.js'
import {
  IconAlert,
  IconCalendar,
  IconChart,
  IconChat,
  IconCheckSquare,
  IconDocument,
  IconFolder,
  IconGrid,
  IconLayers,
  IconRoute,
  IconShare,
} from '../../components/ui/Icons.jsx'

const NAV = [
  { id: 'uebersicht', label: 'Übersicht', to: '/portal/uebersicht', icon: IconGrid },
  { id: 'analyse', label: 'Analyse', to: '/portal/analyse', icon: IconChart },
  { id: 'bremsen', label: 'Umsatzbremsen', to: '/portal/bremsen', icon: IconAlert },
  { id: 'plan', label: '90-Tage-Plan', to: '/portal/plan', icon: IconRoute },
  { id: 'aufgaben', label: 'Aufgaben', to: '/portal/aufgaben', icon: IconCheckSquare },
  { id: 'social', label: 'Social Media', to: '/portal/social', icon: IconShare },
  { id: 'wettbewerb', label: 'Wettbewerb', to: '/portal/wettbewerb', icon: IconLayers },
  { id: 'dokumente', label: 'Dokumente', to: '/portal/dokumente', icon: IconFolder },
  { id: 'berichte', label: 'Berichte', to: '/portal/berichte', icon: IconDocument },
  { id: 'termine', label: 'Termine', to: '/portal/termine', icon: IconCalendar },
  { id: 'nachrichten', label: 'Nachrichten', to: '/portal/nachrichten', icon: IconChat },
]

/**
 * Kundenportal – Projekt- und Analyse-Cockpit eines einzelnen Mandanten.
 *
 * Der Bereich zeigt ausschließlich freigegebene Inhalte des eigenen Projekts.
 * Interne Notizen und andere Kunden sind hier grundsätzlich nicht erreichbar.
 */
export function CustomerApp() {
  const { session } = useSession()
  const { getKunde } = useWorkspace()

  if (!session || session.rolle !== 'kunde') {
    return <Navigate to="/login?rolle=kunde" replace />
  }

  const kunde = getKunde(session.kundeId)
  if (!kunde) return <Navigate to="/login?rolle=kunde" replace />

  return (
    <AppShell
      nav={NAV}
      bereich="Kundenportal"
      badge={{ label: 'Geschützter Projektbereich', tone: 'ok' }}
      kundenBereich={kunde.id}
      aufgabenZiel="/portal/aufgaben"
      benachrichtigungsZiel={() => '/portal/uebersicht'}
      kopf={
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold text-ink">{kunde.unternehmen}</p>
          <span className="hidden shrink-0 sm:inline-flex">
            <Chip size="sm" toneName="neutral">
              Ursachenanalyse
            </Chip>
          </span>
        </div>
      }
    >
      <div className="mx-auto max-w-[88rem]">
        <Routes>
          <Route index element={<Navigate to="uebersicht" replace />} />
          <Route path="uebersicht" element={<ProjectDashboard kunde={kunde} basis="/portal" />} />
          <Route path="analyse" element={<Bereich titel="Ursachenanalyse" text="Zehn Dimensionen mit Reifegrad, Beobachtung, Ursache, Auswirkung, Empfehlung und Beleg. Sichtbar sind alle vom SYMMEDIS-Team freigegebenen Punkte."><AnalysisModule kunde={kunde} rolle="kunde" /></Bereich>} />
          <Route path="bremsen" element={<BremsenSeite kunde={kunde} />} />
          <Route path="plan" element={<Bereich titel="90-Tage-Plan" text="Der Umsetzungsplan, abgeleitet aus den drei größten Umsatzbremsen."><PlanModuleMitNavigation kunde={kunde} /></Bereich>} />
          <Route path="aufgaben" element={<Bereich titel="Aufgaben" text="Maßnahmen aus dem 90-Tage-Plan mit Zuständigkeit, Fälligkeit und Messgröße."><TasksModule kunde={kunde} rolle="kunde" /></Bereich>} />
          <Route path="social" element={<Bereich titel="Social-Media-Analyse" text="Bewertung Ihrer Kanäle nach Reife, Frequenz, Resonanz und Konsistenz."><SocialModule kunde={kunde} rolle="kunde" /></Bereich>} />
          <Route path="wettbewerb" element={<Bereich titel="Positionierung im Wettbewerb" text="Vergleich Ihrer Aussagen mit denen der wichtigsten Anbieter im Umfeld."><CompetitionModule kunde={kunde} /></Bereich>} />
          <Route path="dokumente" element={<Bereich titel="Dokumente" text="Ihre Unterlagen und die Arbeitsergebnisse von SYMMEDIS an einer Stelle."><DocumentsModule kunde={kunde} rolle="kunde" /></Bereich>} />
          <Route path="berichte" element={<Bereich titel="Berichte und Export" text="Freigegebene Berichte sowie der Datenexport Ihrer Analyse."><ReportsModule kunde={kunde} rolle="kunde" /></Bereich>} />
          <Route path="termine" element={<Bereich titel="Termine" text="Alle Besprechungen zu Ihrem Analyseprojekt."><AppointmentsModule kunde={kunde} /></Bereich>} />
          <Route
            path="nachrichten"
            element={
              <Bereich titel="Nachrichten" text="Direkter Draht zum SYMMEDIS-Team. Der Assistent ordnet Ihre Frage sofort ein, verbindlich ist die Antwort des Teams.">
                <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
                  <ChatModule kunde={kunde} rolle="kunde" />
                  <div className="min-w-0 space-y-5">
                    <Card>
                      <CardHeader title="Ihr Projekt" />
                      <CardBody>
                        <KeyValueList items={[
                          { label: 'Unternehmen', value: kunde.unternehmen },
                          { label: 'Ansprechpartner', value: kunde.ansprechpartner.name },
                          { label: 'Analysestart', value: formatDate(kunde.start) },
                          { label: 'Ergebnistermin', value: formatDate(kunde.ergebnis) },
                        ]} />
                      </CardBody>
                    </Card>
                    <ActivityFeed kunde={kunde} titel="Projektverlauf" limit={4} />
                  </div>
                </div>
              </Bereich>
            }
          />
          <Route path="*" element={<Navigate to="/portal/uebersicht" replace />} />
        </Routes>
      </div>
    </AppShell>
  )
}

function Bereich({ titel, text, children }) {
  return (
    <div className="space-y-6">
      <PageHeader title={titel} subtitle={text} />
      {children}
    </div>
  )
}

function PlanModuleMitNavigation({ kunde }) {
  const navigate = useNavigate()
  return <PlanModule kunde={kunde} rolle="kunde" onAufgaben={() => navigate('/portal/aufgaben')} />
}

function BremsenSeite({ kunde }) {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <PageHeader
        title="Die drei größten Umsatzbremsen"
        subtitle="Priorisiert nach Hebelwirkung. Jede Bremse ist mit der Analysedimension verknüpft, aus der sie stammt."
        actions={<Button variant="secondary" size="sm" onClick={() => navigate('/portal/plan')}>Zum 90-Tage-Plan</Button>}
      />

      <Banner toneName="brand" icon={IconAlert} title="Warum nur drei">
        Mehr gleichzeitige Baustellen führen erfahrungsgemäß dazu, dass keine davon zu Ende gebracht wird. Die Auswahl trifft das SYMMEDIS-Team auf Basis der vollständigen Analyse.
      </Banner>

      <BremsenCards kunde={kunde} onOeffnen={() => navigate('/portal/analyse')} />

      <Card>
        <CardHeader title="Wirkungskette" subtitle="Von der Ursache zur Umsatzwirkung" />
        <CardBody className="px-0 py-0">
          <ol className="divide-y divide-line">
            {kunde.bremsen.map((bremse) => (
              <li key={bremse.id} className="px-4 py-4 sm:px-5">
                <p className="text-[0.875rem] font-semibold text-ink">{bremse.rang}. {bremse.titel}</p>
                <dl className="mt-2.5 grid gap-3 sm:grid-cols-3">
                  <div><dt className="text-xs font-medium text-ink-3">Ursache</dt><dd className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink">{bremse.ursache}</dd></div>
                  <div><dt className="text-xs font-medium text-ink-3">Auswirkung</dt><dd className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink">{bremse.beschreibung}</dd></div>
                  <div><dt className="text-xs font-medium text-ink-3">Nächste Aktion</dt><dd className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink">{bremse.naechsteAktion}</dd></div>
                </dl>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  )
}
