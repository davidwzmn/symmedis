import { SeitenKopf, Abschnitt } from './parts.jsx'
import { LeadForm } from './LeadForm.jsx'
import { TERMIN } from '../../content/marketing.js'

export function TerminPage() {
  return (
    <>
      <SeitenKopf eyebrow={TERMIN.label} titel={TERMIN.headline} text={TERMIN.text} />
      <Abschnitt hell>
        <LeadForm />
      </Abschnitt>
    </>
  )
}
