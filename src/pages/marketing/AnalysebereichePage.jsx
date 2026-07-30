import { Link } from 'react-router-dom'
import { KATEGORIEN } from '../../data/catalog.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader } from '../../components/ui/layout.jsx'
import { SeitenKopf, Abschnitt, CtaBand } from './parts.jsx'
import { ANALYSEBEREICHE } from '../../content/marketing.js'
import { IconArrowRight, IconChart, IconShare, IconTarget } from '../../components/ui/Icons.jsx'

const GRUPPEN = [
  { name: 'Strategie', icon: IconTarget, text: 'Der eigene Platz im Markt und der belegte Unterschied.' },
  { name: 'Kommunikation', icon: IconShare, text: 'Ob der Wert schnell und einheitlich verstanden wird.' },
  { name: 'Markt', icon: IconChart, text: 'Ob Aktivitäten systematisch Nachfrage erzeugen.' },
]

const FELDER = [
  { titel: 'Reifegrad', text: 'Ein Wert von 0 bis 100 – niedrig bedeutet starke Umsatzbremse.' },
  { titel: 'Beobachtung', text: 'Was konkret im Material und am Markt sichtbar ist.' },
  { titel: 'Ursache', text: 'Woran es liegt – nicht, was man an der Oberfläche sieht.' },
  { titel: 'Auswirkung', text: 'Wie sich der Punkt wirtschaftlich bemerkbar macht.' },
  { titel: 'Empfehlung', text: 'Der nächste sinnvolle Schritt, priorisiert.' },
  { titel: 'Beleg', text: 'Quelle, Umfang und Zeitraum der Bewertung.' },
]

const STUFEN = [
  { label: 'Kritisch', bereich: '0–39', tone: 'danger' },
  { label: 'Auffällig', bereich: '40–57', tone: 'warn' },
  { label: 'Solide', bereich: '58–74', tone: 'info' },
  { label: 'Stark', bereich: 'ab 75', tone: 'ok' },
]

export function AnalysebereichePage() {
  return (
    <>
      <SeitenKopf
        eyebrow={ANALYSEBEREICHE.label}
        titel={ANALYSEBEREICHE.headline}
        text={ANALYSEBEREICHE.text}
        kennzahlen={[
          { wert: '10', text: 'Analysedimensionen' },
          { wert: '3', text: 'Gruppen: Strategie, Kommunikation, Markt' },
          { wert: '7', text: 'Felder je Dimension' },
          { wert: '3', text: 'größte Umsatzbremsen als Ergebnis' },
        ]}
      />

      <Abschnitt
        eyebrow="Die zehn Bereiche"
        headline="Jeder Bereich beantwortet eine konkrete Frage"
        text="Bewertet wird nicht nach Bauchgefühl, sondern anhand einer festen Leitfrage je Dimension."
        hell
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {GRUPPEN.map((gruppe) => (
            <Card key={gruppe.name}>
              <CardHeader
                title={gruppe.name}
                subtitle={`${KATEGORIEN.filter((k) => k.gruppe === gruppe.name).length} Bereiche`}
                icon={gruppe.icon}
              />
              <CardBody className="px-0 py-0">
                <ul className="divide-y divide-line">
                  {KATEGORIEN.filter((k) => k.gruppe === gruppe.name).map((kategorie) => (
                    <li key={kategorie.id} className="px-4 py-3.5 sm:px-5">
                      <p className="text-[0.875rem] font-medium text-ink">{kategorie.label}</p>
                      <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-2">
                        {kategorie.frage}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </Abschnitt>

      <Abschnitt
        eyebrow="Was je Bereich entsteht"
        headline="Sieben Felder pro Dimension"
        text="Erst diese Struktur macht die Bewertung nachvollziehbar – und die Zusammenschau ergibt die drei größten Umsatzbremsen."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FELDER.map((feld) => (
            <Card key={feld.titel} className="p-5">
              <h3 className="text-[0.9375rem] font-semibold text-ink">{feld.titel}</h3>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-2">{feld.text}</p>
            </Card>
          ))}
          <Card className="flex flex-col justify-center p-5">
            <h3 className="text-[0.9375rem] font-semibold text-ink">Priorität</h3>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-2">
              Hoch, mittel oder niedrig – legt die Reihenfolge im 90-Tage-Plan fest.
            </p>
          </Card>
        </div>

        <div className="mt-8 rounded-card border border-line bg-canvas p-5 sm:p-6">
          <p className="text-xs font-semibold text-ink-2">Bewertungsstufen des Reifegrads</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STUFEN.map((stufe) => (
              <Chip key={stufe.label} toneName={stufe.tone}>
                {stufe.label} · {stufe.bereich}
              </Chip>
            ))}
          </div>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-3">
            Die Farbe ist nie der alleinige Träger – jede Stufe ist zusätzlich beschriftet.
          </p>
        </div>

        <div className="mt-8">
          <Button as={Link} to="/demo/analyse" variant="secondary">
            Analyse in der Demo ansehen
            <IconArrowRight className="size-4" />
          </Button>
        </div>
      </Abschnitt>

      <CtaBand
        titel="Sehen Sie die zehn Bereiche an einem Beispiel"
        text="Die Produktdemo zeigt die vollständige Analyse eines fiktiven Unternehmens – mit Reifegrad, Beleg und den drei größten Umsatzbremsen."
        primaer={{ to: '/demo', label: 'Produktdemo öffnen' }}
        sekundaer={{ to: '/funktionsweise', label: 'Funktionsweise' }}
      />
    </>
  )
}
