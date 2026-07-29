import { useEffect } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SessionProvider } from './state/SessionProvider.jsx'
import { WorkspaceProvider } from './state/WorkspaceProvider.jsx'
import { ToastProvider } from './components/ui/ToastProvider.jsx'
import { MarketingPage } from './pages/marketing/MarketingPage.jsx'
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
              <Route path="/" element={<MarketingPage />} />
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
