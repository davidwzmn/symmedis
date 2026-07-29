import { Link } from 'react-router-dom'
import { Button } from '../components/ui/primitives.jsx'
import { Logo } from '../components/brand/Logo.jsx'
import { IconArrowRight } from '../components/ui/Icons.jsx'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo bereich="Diagnosis OS" />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">Seite nicht gefunden</h1>
      <p className="mt-2.5 max-w-md text-[0.9375rem] leading-relaxed text-ink-2">
        Diese Adresse gehört zu keinem Bereich der Plattform. Möglicherweise wurde der Link
        geändert oder das Projekt liegt in einem anderen Portal.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/">
          Zur Website
          <IconArrowRight className="size-4" />
        </Button>
        <Button as={Link} to="/demo" variant="secondary">
          Produktdemo öffnen
        </Button>
        <Button as={Link} to="/login" variant="ghost">
          Anmelden
        </Button>
      </div>
    </div>
  )
}
