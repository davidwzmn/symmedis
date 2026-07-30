import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader } from '../../components/ui/layout.jsx'
import { SeitenKopf, Abschnitt, CtaBand } from './parts.jsx'
import { ANGEBOT, UEBER_UNS } from '../../content/marketing.js'
import { IconArrowRight, IconCheck } from '../../components/ui/Icons.jsx'

export function AngebotPage() {
  return (
    <>
      <SeitenKopf
        eyebrow={ANGEBOT.label}
        titel={ANGEBOT.headline}
        text={ANGEBOT.text}
        kennzahlen={ANGEBOT.fakten.map((f) => ({ wert: f.wert, text: f.label }))}
      />

      <Abschnitt
        eyebrow="Leistungsumfang"
        headline="Enthalten in jeder Ursachenanalyse"
        text="Ein fester Umfang, kein Baukasten mit versteckten Zusatzposten."
        hell
      >
        <Card>
          <CardBody className="px-0 py-0">
            <ul className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
              {ANGEBOT.leistungen.map((leistung) => (
                <li
                  key={leistung}
                  className="flex items-start gap-2.5 px-4 py-3.5 text-[0.875rem] text-ink sm:px-5"
                >
                  <IconCheck className="mt-0.5 size-4 shrink-0 text-ok-ink" />
                  {leistung}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </Abschnitt>

      <Abschnitt eyebrow={UEBER_UNS.label} headline={UEBER_UNS.headline} text={UEBER_UNS.text}>
        <div className="grid gap-4 md:grid-cols-3">
          {UEBER_UNS.prinzipien.map((prinzip) => (
            <Card key={prinzip.titel} className="p-5">
              <h3 className="text-[0.9375rem] font-semibold text-ink">{prinzip.titel}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{prinzip.text}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader title="Eckdaten" subtitle="Das Wichtigste auf einen Blick" />
            <CardBody>
              <dl className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
                {ANGEBOT.fakten.map((fakt) => (
                  <div key={fakt.label} className="flex items-baseline justify-between gap-3 border-b border-line pb-2.5">
                    <dt className="text-[0.8125rem] text-ink-2">{fakt.label}</dt>
                    <dd className="text-[0.875rem] font-semibold text-ink">{fakt.wert}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card className="flex flex-col justify-between bg-surface-inverse p-5 sm:p-6">
            <div>
              <h3 className="text-[0.9375rem] font-semibold text-canvas">Erst prüfen, dann entscheiden</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-canvas/80">
                Im 15-Minuten-Gespräch klären wir, ob eine Ursachenanalyse in Ihrer Situation
                überhaupt sinnvoll ist. Wenn nicht, sagen wir das.
              </p>
            </div>
            <Button as={Link} to="/termin" variant="on-dark" size="sm" className="mt-5 self-start">
              Gespräch vereinbaren
              <IconArrowRight className="size-4" />
            </Button>
          </Card>
        </div>
      </Abschnitt>

      <CtaBand
        titel="Bereit für eine belastbare Antwort?"
        text="Ein 15-minütiges Diagnosegespräch klärt, ob und wie wir helfen können – ohne Verkaufsrunde."
        sekundaer={{ to: '/faq', label: 'Häufige Fragen' }}
      />
    </>
  )
}
