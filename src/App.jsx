import { useEffect } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SessionProvider } from './state/SessionProvider.jsx'
import { WorkspaceProvider } from './state/WorkspaceProvider.jsx'
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
import { LoginPage } from './pages/LoginPage.jsx'
import { DemoApp } from './pages/demo/DemoApp.jsx'
import { CustomerApp } from './pages/customer/CustomerApp.jsx'
import { StaffApp } from './pages/staff/StaffApp.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'

/** Beim Seitenwechsel nach oben – sonst startet die neue Seite mittendrin. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

/**
 * Auf einem Server mit SPA-Rewrite (npm run preview) laufen echte Pfade.
 * Für rein statisches Hosting ohne Rewrite lässt sich per
 * `VITE_ROUTER=hash npm run build` auf Hash-Routen umstellen – sonst
 * beantwortet der Host jeden Unterpfad mit 404.
 */
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter

export default function App() {
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
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/demo/*" element={<DemoApp />} />
              <Route path="/portal/*" element={<CustomerApp />} />
              <Route path="/intern/*" element={<StaffApp />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </WorkspaceProvider>
        </SessionProvider>
      </ToastProvider>
    </Router>
  )
}
