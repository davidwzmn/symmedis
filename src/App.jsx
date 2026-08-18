import { useEffect, useState } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SessionProvider } from './state/SessionProvider.jsx'
import { WorkspaceProvider } from './state/WorkspaceProvider.jsx'
import { DemoWorkspaceProvider } from './state/DemoWorkspaceProvider.jsx'
import { useWorkspace } from './hooks/useWorkspace.js'
import { useSession } from './hooks/useSession.js'
import { consumeAuthRedirectSession } from './lib/supabase.js'
import { ToastProvider } from './components/ui/ToastProvider.jsx'
import { Skeleton } from './components/ui/layout.jsx'
import { MarketingLayout } from './pages/marketing/MarketingLayout.jsx'
import { HomePage } from './pages/marketing/HomePage.jsx'
import { ProblemPage } from './pages/marketing/ProblemPage.jsx'
import { AnalysebereichePage } from './pages/marketing/AnalysebereichePage.jsx'
import { FunktionsweisePage } from './pages/marketing/FunktionsweisePage.jsx'
import { PlattformPage } from './pages/marketing/PlattformPage.jsx'
import { AngebotPage } from './pages/marketing/AngebotPage.jsx'
import { FaqPage } from './pages/marketing/FaqPage.jsx'
import { TerminPage } from './pages/marketing/TerminPage.jsx'
import { LegalPage } from './pages/marketing/LegalPage.jsx'
import { IMPRESSUM, DATENSCHUTZ, AGB } from './content/legal.js'
import { LoginPage } from './pages/LoginPage.jsx'
import { DemoApp } from './pages/demo/DemoApp.jsx'
import { CustomerApp } from './pages/customer/CustomerApp.jsx'
import { StaffApp } from './pages/staff/StaffApp.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }) }, [pathname])
  return null
}

function WorkspaceLoading() {
  return (
    <main className="shell-container py-8 sm:py-10" aria-live="polite" aria-busy="true">
      <div className="mx-auto max-w-[92rem] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3 w-64 max-w-[70vw] rounded-md" />
          </div>
          <Skeleton className="hidden h-9 w-28 rounded-lg sm:block" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-card" />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Skeleton className="h-80 rounded-card" />
          <div className="space-y-5">
            <Skeleton className="h-36 rounded-card" />
            <Skeleton className="h-36 rounded-card" />
          </div>
        </div>
        <p className="sr-only">Ihre autorisierten Projekt- und Analysedaten werden sicher geladen.</p>
      </div>
    </main>
  )
}

function ConnectivityNotice() {
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine)

  useEffect(() => {
    const onlineHandler = () => setOnline(true)
    const offlineHandler = () => setOnline(false)
    window.addEventListener('online', onlineHandler)
    window.addEventListener('offline', offlineHandler)
    return () => {
      window.removeEventListener('online', onlineHandler)
      window.removeEventListener('offline', offlineHandler)
    }
  }, [])

  if (online) return null

  return (
    <div className="sticky top-0 z-[72] border-b border-warn-border bg-warn-soft px-4 py-2.5" role="status" aria-live="polite">
      <div className="mx-auto max-w-[92rem] text-sm leading-relaxed text-warn-ink">
        <strong className="font-semibold">Keine Internetverbindung.</strong> Bereits geladene Inhalte bleiben sichtbar. Änderungen und Uploads können erst wieder sicher gespeichert werden, sobald die Verbindung zurück ist.
      </div>
    </div>
  )
}

function WorkspaceGate({ children }) {
  const { session, echteAuthentifizierung } = useSession()
  const {
    workspaceBereit,
    workspaceFehler,
    workspaceAktionsfehler,
    aktionsfehlerLeeren,
    workspaceFuerUser,
    neuLaden,
  } = useWorkspace()
  const aktuellerWorkspaceGeladen = !echteAuthentifizierung || !session?.userId || workspaceFuerUser === session.userId

  if (!workspaceBereit || !aktuellerWorkspaceGeladen) return <WorkspaceLoading />

  if (workspaceFehler) {
    return (
      <main className="shell-container flex min-h-[60vh] items-center justify-center py-16">
        <div className="w-full max-w-lg rounded-2xl border border-danger-border bg-danger-soft p-8 text-center" role="alert">
          <h1 className="text-base font-semibold text-danger-ink">Workspace konnte nicht geladen werden</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{workspaceFehler}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-3">Ihre Daten wurden nicht verändert. Prüfen Sie die Verbindung und versuchen Sie es erneut.</p>
          <button type="button" onClick={neuLaden} className="mt-5 min-h-11 rounded-lg bg-surface-inverse px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Erneut laden</button>
        </div>
      </main>
    )
  }

  return (
    <>
      <ConnectivityNotice />
      {workspaceAktionsfehler ? (
        <div className="sticky top-0 z-[70] border-b border-danger-border bg-danger-soft px-4 py-2.5" role="alert" aria-live="assertive">
          <div className="mx-auto flex max-w-[92rem] items-start justify-between gap-4">
            <p className="text-sm leading-relaxed text-danger-ink"><strong className="font-semibold">Änderung nicht gespeichert.</strong> {workspaceAktionsfehler} Der letzte bestätigte Stand bleibt erhalten.</p>
            <button type="button" onClick={aktionsfehlerLeeren} className="min-h-9 shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-danger-ink hover:bg-danger-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label="Speicherfehler-Hinweis schließen">Schließen</button>
          </div>
        </div>
      ) : null}
      {children}
    </>
  )
}

const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter

export default function App() {
  consumeAuthRedirectSession()
  return (
    <Router>
      <ToastProvider>
        <SessionProvider>
          <WorkspaceProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<MarketingLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/problem" element={<ProblemPage />} />
                <Route path="/analysebereiche" element={<AnalysebereichePage />} />
                <Route path="/funktionsweise" element={<FunktionsweisePage />} />
                <Route path="/plattform" element={<PlattformPage />} />
                <Route path="/angebot" element={<AngebotPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/termin" element={<TerminPage />} />
                <Route path="/impressum" element={<LegalPage dokument={IMPRESSUM} />} />
                <Route path="/datenschutz" element={<LegalPage dokument={DATENSCHUTZ} />} />
                <Route path="/agb" element={<LegalPage dokument={AGB} />} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/demo/*" element={<DemoWorkspaceProvider><DemoApp /></DemoWorkspaceProvider>} />
              <Route path="/portal/*" element={<WorkspaceGate><CustomerApp /></WorkspaceGate>} />
              <Route path="/intern/*" element={<WorkspaceGate><StaffApp /></WorkspaceGate>} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </WorkspaceProvider>
        </SessionProvider>
      </ToastProvider>
    </Router>
  )
}
