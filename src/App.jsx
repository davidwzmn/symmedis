import { useCallback, useState } from 'react'
import { Footer } from './components/layout/Footer.jsx'
import { Header } from './components/layout/Header.jsx'
import { LegalModal } from './components/LegalModal.jsx'
import { DemoModal } from './components/demo/DemoModal.jsx'
import { PortalModal } from './components/portal/PortalModal.jsx'
import { Angebot } from './components/sections/Angebot.jsx'
import { Hero } from './components/sections/Hero.jsx'
import { Problem } from './components/sections/Problem.jsx'
import { Prozess } from './components/sections/Prozess.jsx'
import { Termin } from './components/sections/Termin.jsx'
import { UeberUns } from './components/sections/UeberUns.jsx'
import { Zielgruppe } from './components/sections/Zielgruppe.jsx'
import { useTheme } from './hooks/useTheme.js'

export default function App() {
  const { theme, toggleTheme } = useTheme()

  const [demoOpen, setDemoOpen] = useState(false)
  const [portalOpen, setPortalOpen] = useState(false)
  const [portalRole, setPortalRole] = useState('kunde')
  const [session, setSession] = useState(null)
  const [legalId, setLegalId] = useState(null)

  // Es ist immer höchstens ein Dialog offen.
  const openDemo = useCallback(() => {
    setPortalOpen(false)
    setLegalId(null)
    setDemoOpen(true)
  }, [])

  const openPortal = useCallback((role = 'kunde') => {
    setDemoOpen(false)
    setLegalId(null)
    setPortalRole(role)
    // Wer ausdrücklich einen anderen Zugang wählt, landet im passenden Login –
    // sonst öffnete "Mitarbeiterlogin" die noch aktive Kundensitzung.
    setSession((current) => (current && current.role !== role ? null : current))
    setPortalOpen(true)
  }, [])

  const openLegal = useCallback((id) => {
    setDemoOpen(false)
    setPortalOpen(false)
    setLegalId(id)
  }, [])

  return (
    <>
      <a
        href="#hauptinhalt"
        className="sr-only rounded-sm bg-marine-800 px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[110]"
      >
        Zum Hauptinhalt springen
      </a>

      <Header theme={theme} onToggleTheme={toggleTheme} onOpenPortal={openPortal} />

      <main id="hauptinhalt">
        <Hero onOpenDemo={openDemo} />
        <Problem />
        <Prozess onOpenDemo={openDemo} />
        <Zielgruppe />
        <Angebot onOpenDemo={openDemo} />
        <UeberUns />
        <Termin onOpenDemo={openDemo} />
      </main>

      <Footer onOpenLegal={openLegal} onOpenPortal={openPortal} />

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />

      <PortalModal
        open={portalOpen}
        onClose={() => setPortalOpen(false)}
        session={session}
        initialRole={portalRole}
        onLogin={setSession}
        onLogout={() => setSession(null)}
      />

      <LegalModal openId={legalId} onClose={() => setLegalId(null)} />
    </>
  )
}
