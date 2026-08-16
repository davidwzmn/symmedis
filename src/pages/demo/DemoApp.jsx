import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { AppShell } from '../../components/shell/AppShell.jsx'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { PageHeader, Banner } from '../../components/ui/layout.jsx'
import { ProjectDashboard } from '../../components/modules/ProjectDashboard.jsx'
import { AnalysisModule } from '../../components/modules/AnalysisModule.jsx'
import { DiagnosisGraph } from '../../components/modules/DiagnosisGraph.jsx'
import { SocialModule } from '../../components/modules/SocialModule.jsx'
import { PlanModule } from '../../components/modules/PlanModule.jsx'
import { TasksModule } from '../../components/modules/TasksModule.jsx'
import { DocumentsModule } from '../../components/modules/DocumentsModule.jsx'
import { ReportsModule } from '../../components/modules/ReportsModule.jsx'
import { ChatModule } from '../../components/modules/ChatModule.jsx'
import {
  IconChart,
  IconChat,
  IconCheckSquare,
  IconDocument,
  IconFolder,
  IconGrid,
  IconLogout,
  IconRoute,
  IconShare,
} from '../../components/ui/Icons.jsx'

/** Fester Beispielkunde der Demo. */
const DEMO_KUNDE = 'nordvita'

const NAV = [
  { id: 'uebersicht', label: 'Übersicht', to: '/demo/uebersicht', icon: IconGrid },
  { id: 'analyse', label: 'Analyse', to: '/demo/analyse', icon: IconChart },
  { id: 'social', label: 'Social Media', to: '/demo/social', icon: IconShare },
  { id: 'dokumente', label: 'Dokumente', to: '/demo/dokumente', icon: IconFolder },
  { id: 'plan', label: '90-Tage-Plan', to: '/demo/plan', icon: IconRoute },
  { id: 'aufgaben', label: 'Aufgaben', to: '/demo/aufgaben', icon: IconCheckSquare },
  { id: 'nachrichten', label: 'Chat', to: '/demo/nachrichten', icon: IconChat },
  { id: 'bericht', label: 'Bericht', to: '/demo/bericht', icon: IconDocument },
]

/**
 * Öffentliche Produktdemo.
 *
 * Zeigt die Plattform mit einem vollständig gekennzeichneten Beispielprojekt.
 * Alles läuft ohne Backend; geschrieben wird nur in den Sitzungszustand.
 */
export function DemoApp() {
  const { getKunde } = useWorkspace()
  const kunde = getKunde(DEMO_KUNDE)

  if (!kunde) return <Navigate to="/" replace />

  return (
    <AppShell
      nav={NAV}
      bereich="Produktdemo"
      badge={{ label: 'Demo-Daten', tone: 'warn' }}
      zeigeBenachrichtigungen={false}
      kundenBereich={DEMO_KUNDE}
      aufgabenZiel="/demo/aufgaben"
      footerSlot={
        <Button as={Link} to="/" variant="ghost" size="sm" fullWidth className="justify-start">
          <IconLogout className="size-4 shrink-0" />
          <span className="hidden lg:inline">Demo verlassen</span>
        </Button>
      }
      kopf={
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold text-ink">{kunde.unternehmen}</p>
          <span className="hidden shrink-0 sm:inline-flex">
            <Chip size="sm" toneName="neutral">
              Beispielprojekt
            </Chip>
          </span>
        </div>
      }
    >
      <div className="mx-auto max-w-[88rem] space-y-6">
        <Banner toneName="warn" title="Interaktive Produktdemo">
          Sie sehen die Plattform mit einem fiktiven Beispielunternehmen. Alle Zahlen, Texte und
          Dokumente sind erfunden. Änderungen bestehen nur in dieser Sitzung und werden nicht
          gespeichert.
        </Banner>

        <Routes>
          <Route index element={<Navigate to="uebersicht" replace />} />
          <Route
            path="uebersicht"
            element={
              <ProjectDashboard
                kunde={kunde}
                basis="/demo"
                rolle="demo"
                begruessung="Projektübersicht"
              />
            }
          />
          <Route
            path="analyse"
            element={
              <Bereich
                titel="Ursachenanalyse"
                text="Zehn Dimensionen, je mit Score, Beobachtung, Ursache, Auswirkung, Empfehlung und Beleg. In der Demo schreibgeschützt."
              >
                <DiagnosisGraph kunde={kunde} />
                <AnalysisModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="social"
            element={
              <Bereich
                titel="Social-Media-Analyse"
                text="Kanalreife, Frequenz, Resonanz und erkannte Lücken – ausgewertet aus öffentlich sichtbaren Beiträgen."
              >
                <SocialModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="dokumente"
            element={
              <Bereich
                titel="Dokumente"
                text="Unterlagen des Projekts mit Versionsstand. In der Demo ohne Upload."
              >
                <DocumentsModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="plan"
            element={
              <Bereich
                titel="90-Tage-Plan"
                text="Drei Phasen von der Ursache über die Wirkung bis zur verankerten Nachfrage."
              >
                <PlanModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="aufgaben"
            element={
              <Bereich
                titel="Aufgaben"
                text="Maßnahmen mit Zuständigkeit, Fälligkeit und Messgröße."
              >
                <TasksModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="nachrichten"
            element={
              <Bereich
                titel="Nachrichten"
                text="Der Chat ist ein Modul der Plattform – nicht ihr Mittelpunkt. Der Assistent ordnet ein, verbindlich ist die Antwort des Teams."
              >
                <ChatModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="bericht"
            element={
              <Bereich
                titel="Berichte und Export"
                text="Strategiebericht, Teilberichte und Datenexport aus dem aktuellen Projektstand."
              >
                <ReportsModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route path="*" element={<Navigate to="/demo/uebersicht" replace />} />
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
