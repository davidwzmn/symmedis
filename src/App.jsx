import { useEffect } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SessionProvider } from './state/SessionProvider.jsx'
import { WorkspaceProvider } from './state/WorkspaceProvider.jsx'
import { useWorkspace } from './hooks/useWorkspace.js'
import { consumeAuthRedirectSession } from './lib/supabase.js'
import { ToastProvider } from './components/ui/ToastProvider.jsx'
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

function WorkspaceGate({ children }) {
  const { workspaceBereit, workspaceFehler, neuLaden } = useWorkspace()
  if (!workspaceBereit) {
    return (
      <main className="shell-container flex min-h-[60vh] items-center justify-center py-16" aria-live="polite">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-line-strong border-t-brand" aria-hidden="true" />
          <h1 className="mt-5 text-base font-semibold text-ink">SYMMEDIS wird geladen</h1>
          <p className="mt-2 text-sm text-ink-2">Ihre autorisierten Projekt- und Analysedaten werden sicher geladen.</p>
        </div>
      </main>
    )
  }
  if (workspaceFehler) {
    return (
      <main className="shell-container flex min-h-[60vh] items-center justify-center py-16">
        <div className="w-full max-w-lg rounded-2xl border border-danger-border bg-danger-soft p-8 text-center">
          <h1 className="text-base font-semibold text-danger-ink">Workspace konnte nicht geladen werden</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{workspaceFehler}</p>
          <button type="button" onClick={neuLaden} className="mt-5 rounded-lg bg-surface-inverse px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">Erneut laden</button>
        </div>
      </main>
    )
  }
  return children
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
              <Route path="/demo/*" element={<DemoApp />} />
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
