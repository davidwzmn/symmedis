import { SeitenKopf, Abschnitt, TerminFormular } from './parts.jsx'
import { TERMIN } from '../../content/marketing.js'

export function TerminPage() {
  return (
    <>
      <SeitenKopf eyebrow={TERMIN.label} titel={TERMIN.headline} text={TERMIN.text} />

      <Abschnitt hell>
        <TerminFormular />
      </Abschnitt>
    </>
  )
}
