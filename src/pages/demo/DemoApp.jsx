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
  IconArrowRight,
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

const DEMO_STEPS = [
  ['1', 'Ursache statt Symptom', '/demo/analyse', 'Öffnen Sie ein Finding und prüfen Sie Score, Ursache, Auswirkung, Evidenz und Freigabestatus.'],
  ['2', 'Priorisierte Umsetzung', '/demo/plan', 'Sehen Sie, wie Findings in einen 30/60/90-Tage-Plan mit Verantwortlichkeiten überführt werden.'],
  ['3', 'Kundenarbeitsraum', '/demo/aufgaben', 'Testen Sie Aufgaben, Statuslogik und die Sicht auf konkrete nächste Schritte.'],
  ['4', 'Management-Ergebnis', '/demo/bericht', 'Prüfen Sie, wie aus dem Projektstand ein nachvollziehbares Ergebnis statt einer Blackbox entsteht.'],
]

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
            <Chip size="sm" toneName="neutral">Fiktiver Demokunde</Chip>
          </span>
        </div>
      }
    >
      <div className="mx-auto max-w-[88rem] space-y-6">
        <Banner toneName="warn" title="Sichere, interaktive Produktdemo">
          Nordvita ist ein vollständig fiktives Beispielunternehmen. Alle Inhalte sind erfunden, es werden keine Kundendaten geladen und Änderungen verlassen diese Demo-Sitzung nicht.
        </Banner>

        <Routes>
          <Route index element={<Navigate to="uebersicht" replace />} />
          <Route
            path="uebersicht"
            element={
              <div className="space-y-6">
                <DemoGuide />
                <ProjectDashboard kunde={kunde} basis="/demo" rolle="demo" begruessung="Projektübersicht" />
              </div>
            }
          />
          <Route
            path="analyse"
            element={
              <Bereich titel="Ursachenanalyse" text="Zehn Dimensionen, je mit Score, Beobachtung, Ursache, Auswirkung, Empfehlung und Beleg. Die Demo bleibt schreibgeschützt.">
                <DiagnosisGraph kunde={kunde} />
                <AnalysisModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="social"
            element={
              <Bereich titel="Social-Media-Analyse" text="Kanalreife, Frequenz, Resonanz und erkannte Lücken – als Teil des gesamten Wachstumssystems.">
                <SocialModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="dokumente"
            element={
              <Bereich titel="Dokumente" text="Unterlagen des Projekts mit Versionsstand. Uploads sind in der öffentlichen Demo absichtlich deaktiviert.">
                <DocumentsModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="plan"
            element={
              <Bereich titel="90-Tage-Plan" text="Drei Phasen von der Ursache über die Wirkung bis zur verankerten Nachfrage.">
                <PlanModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="aufgaben"
            element={
              <Bereich titel="Aufgaben" text="Maßnahmen mit Zuständigkeit, Fälligkeit und Messgröße. Änderungen bleiben ausschließlich lokal in dieser Demo-Sitzung.">
                <TasksModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="nachrichten"
            element={
              <Bereich titel="Nachrichten" text="Der Chat ist ein Arbeitsmodul – nicht die Quelle der Wahrheit. Verbindliche Ergebnisse bleiben nachvollziehbar freigegeben.">
                <ChatModule kunde={kunde} rolle="demo" />
              </Bereich>
            }
          />
          <Route
            path="bericht"
            element={
              <Bereich titel="Berichte und Export" text="Management-Ergebnis, Teilberichte und Datenexport aus einem nachvollziehbaren Projektstand.">
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

function DemoGuide() {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="border-b border-line px-5 py-5 sm:px-6">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand-ink">5-Minuten-Produkttour</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">So testen Sie SYMMEDIS wie ein echter Kunde.</h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-2">Folgen Sie vier Stationen vom Finding bis zur Umsetzung. Sie benötigen keinen Account und können keine echten Daten verändern.</p>
          </div>
          <Button as={Link} to="/termin" variant="secondary" size="sm">Eigene Diagnose besprechen <IconArrowRight className="size-4" /></Button>
        </div>
      </div>
      <div className="grid gap-px bg-line md:grid-cols-2 xl:grid-cols-4">
        {DEMO_STEPS.map(([number, title, to, text]) => (
          <Link key={number} to={to} className="group bg-surface p-5 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-ink">{number}</span>
              <IconArrowRight className="size-4 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-ink" />
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{text}</p>
          </Link>
        ))}
      </div>
    </section>
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
