import { Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from '../../hooks/useSession.js'
import { AppShell } from '../../components/shell/AppShell.jsx'
import { Chip } from '../../components/ui/primitives.jsx'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { StaffDashboard } from './StaffDashboard.jsx'
import { ClientsPage } from './ClientsPage.jsx'
import { ClientDetail } from './ClientDetail.jsx'
import { ApprovalCenter } from './ApprovalCenter.jsx'
import { AnalysesPage } from './AnalysesPage.jsx'
import { StaffTasksPage, StaffDocumentsPage, StaffReportsPage, StaffAppointmentsPage, StaffInboxPage, StaffSocialPage } from './StaffLists.jsx'
import { TeamPage } from './TeamPage.jsx'
import { LeadsPage } from './LeadsPage.jsx'
import { AuditPage } from './AuditPage.jsx'
import { SettingsPage } from './SettingsPage.jsx'
import {
  IconBuilding,
  IconCalendar,
  IconChart,
  IconChat,
  IconCheckSquare,
  IconDocument,
  IconFolder,
  IconGrid,
  IconHistory,
  IconMail,
  IconSettings,
  IconShare,
  IconShield,
  IconUsers,
} from '../../components/ui/Icons.jsx'

export function StaffApp() {
  const { session } = useSession()
  const { kennzahlen } = useWorkspace()

  if (!session || session.rolle !== 'intern') return <Navigate to="/login?rolle=intern" replace />

  const nav = [
    { id: 'uebersicht', label: 'Übersicht', to: '/intern/uebersicht', icon: IconGrid },
    { id: 'anfragen', label: 'Website-Anfragen', to: '/intern/anfragen', icon: IconMail },
    { id: 'kunden', label: 'Kunden', to: '/intern/kunden', icon: IconBuilding },
    { id: 'analysen', label: 'Analysen', to: '/intern/analysen', icon: IconChart },
    { id: 'freigaben', label: 'Freigaben', to: '/intern/freigaben', icon: IconShield, badge: kennzahlen.offeneFreigaben, badgeTone: 'warn' },
    { id: 'aufgaben', label: 'Aufgaben', to: '/intern/aufgaben', icon: IconCheckSquare, badge: kennzahlen.ueberfaellig, badgeTone: 'urgent' },
    { id: 'dokumente', label: 'Dokumente', to: '/intern/dokumente', icon: IconFolder, badge: kennzahlen.neueDokumente, badgeTone: 'info' },
    { id: 'social', label: 'Social Media', to: '/intern/social', icon: IconShare },
    { id: 'berichte', label: 'Berichte', to: '/intern/berichte', icon: IconDocument },
    { id: 'termine', label: 'Termine', to: '/intern/termine', icon: IconCalendar },
    { id: 'posteingang', label: 'Posteingang', to: '/intern/posteingang', icon: IconChat },
    { id: 'team', label: 'Team', to: '/intern/team', icon: IconUsers },
    { id: 'verlauf', label: 'Aktivitäten', to: '/intern/verlauf', icon: IconHistory },
    { id: 'einstellungen', label: 'Einstellungen', to: '/intern/einstellungen', icon: IconSettings },
  ]

  return (
    <AppShell
      nav={nav}
      bereich="Mitarbeiterportal"
      badge={{ label: 'Interner Bereich', tone: 'info' }}
      kopf={<div className="flex min-w-0 items-center gap-2"><p className="truncate text-sm font-semibold text-ink">SYMMEDIS Diagnosis OS</p><span className="hidden shrink-0 sm:inline-flex"><Chip size="sm" toneName="neutral">{kennzahlen.aktiveKunden} aktive Projekte</Chip></span></div>}
    >
      <div className="mx-auto max-w-[92rem]">
        <Routes>
          <Route index element={<Navigate to="uebersicht" replace />} />
          <Route path="uebersicht" element={<StaffDashboard />} />
          <Route path="anfragen" element={<LeadsPage />} />
          <Route path="kunden" element={<ClientsPage />} />
          <Route path="kunden/:kundeId" element={<ClientDetail />} />
          <Route path="analysen" element={<AnalysesPage />} />
          <Route path="freigaben" element={<ApprovalCenter />} />
          <Route path="aufgaben" element={<StaffTasksPage />} />
          <Route path="dokumente" element={<StaffDocumentsPage />} />
          <Route path="social" element={<StaffSocialPage />} />
          <Route path="berichte" element={<StaffReportsPage />} />
          <Route path="termine" element={<StaffAppointmentsPage />} />
          <Route path="posteingang" element={<StaffInboxPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="verlauf" element={<AuditPage />} />
          <Route path="einstellungen" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/intern/uebersicht" replace />} />
        </Routes>
      </div>
    </AppShell>
  )
}
