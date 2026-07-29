import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { KATEGORIEN, KATEGORIE_MAP } from '../../data/catalog.js'
import { scoreStufe, tone } from '../../lib/tone.js'
import { cn } from '../../lib/cn.js'
import { Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader, PageHeader, Banner } from '../../components/ui/layout.jsx'
import { Segmented } from '../../components/ui/forms.jsx'
import { BarList } from '../../components/viz/charts.jsx'
import { IconChart, IconInfo } from '../../components/ui/Icons.jsx'

/**
 * Analysen im Quervergleich.
 *
 * Zeigt dieselbe Dimension über alle Projekte hinweg – so werden Muster im
 * Portfolio sichtbar, die im Einzelprojekt nicht auffallen.
 */
export function AnalysesPage() {
  const { kunden } = useWorkspace()
  const navigate = useNavigate()
  const [ansicht, setAnsicht] = useState('matrix')

  const durchschnitt = useMemo(
    () =>
      KATEGORIEN.map((kategorie) => ({
        label: kategorie.label,
        value: Math.round(
          kunden.reduce(
            (summe, kunde) =>
              summe + (kunde.analyse.find((a) => a.kategorieId === kategorie.id)?.score ?? 0),
            0,
          ) / kunden.length,
        ),
      })),
    [kunden],
  )

  const schwaechste = [...durchschnitt].sort((a, b) => a.value - b.value)[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysen"
        subtitle="Alle laufenden Bewertungen im Quervergleich. Die Matrix zeigt jede Dimension über alle Projekte."
        actions={
          <Segmented
            label="Ansicht wählen"
            value={ansicht}
            onChange={setAnsicht}
            options={[
              { value: 'matrix', label: 'Matrix' },
              { value: 'mittel', label: 'Portfolio' },
            ]}
          />
        }
      />

      <Banner toneName="info" icon={IconInfo} title="Muster im Portfolio">
        Schwächste Dimension über alle Projekte: <strong>{schwaechste.label}</strong> mit einem
        Mittelwert von {schwaechste.value}. Das ist ein Hinweis auf ein Marktmuster, nicht auf einen
        Einzelfall.
      </Banner>

      {ansicht === 'mittel' ? (
        <Card>
          <CardHeader
            title="Mittelwerte je Dimension"
            subtitle="Über alle Projekte, aufsteigend"
            icon={IconChart}
          />
          <CardBody>
            <BarList items={durchschnitt} max={100} />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Analysematrix"
            subtitle="Zeile = Projekt, Spalte = Dimension. Jede Zelle nennt den Reifegrad."
          />
          <CardBody className="px-0 py-0">
            <div className="scroll-area overflow-x-auto">
              <table className="w-full min-w-[56rem] border-collapse text-sm">
                <caption className="sr-only">
                  Reifegrad aller Projekte über zehn Analysedimensionen
                </caption>
                <thead>
                  <tr className="border-b border-line">
                    <th
                      scope="col"
                      className="sticky left-0 z-10 bg-surface px-4 py-2.5 text-left text-xs font-semibold text-ink-2 sm:px-5"
                    >
                      Projekt
                    </th>
                    {KATEGORIEN.map((kategorie) => (
                      <th
                        key={kategorie.id}
                        scope="col"
                        className="px-2 py-2.5 text-center text-xs font-semibold text-ink-2"
                      >
                        {kategorie.kurz}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kunden.map((kunde) => (
                    <tr
                      key={kunde.id}
                      onClick={() => navigate(`/intern/kunden/${kunde.id}`)}
                      className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-surface-muted"
                    >
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-surface px-4 py-3 text-left sm:px-5"
                      >
                        <span className="block text-[0.8125rem] font-medium text-ink">
                          {kunde.kurz}
                        </span>
                        <span className="block text-xs text-ink-3">Gesamt {kunde.gesamtScore}</span>
                      </th>
                      {KATEGORIEN.map((kategorie) => {
                        const eintrag = kunde.analyse.find((a) => a.kategorieId === kategorie.id)
                        const stufe = scoreStufe(eintrag.score)
                        return (
                          <td key={kategorie.id} className="px-2 py-3 text-center">
                            <span
                              title={`${KATEGORIE_MAP[kategorie.id].label}: ${eintrag.score} (${stufe.label})`}
                              className={cn(
                                'tabular inline-flex h-7 w-11 items-center justify-center rounded-md border text-xs font-semibold',
                                tone(stufe.tone).chip,
                              )}
                            >
                              {eintrag.score}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
          <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3 sm:px-5">
            <span className="text-xs text-ink-3">Bewertungsstufen:</span>
            {[
              { label: 'Kritisch (0–39)', tone: 'danger' },
              { label: 'Auffällig (40–57)', tone: 'warn' },
              { label: 'Solide (58–74)', tone: 'info' },
              { label: 'Stark (ab 75)', tone: 'ok' },
            ].map((stufe) => (
              <Chip key={stufe.label} size="sm" toneName={stufe.tone}>
                {stufe.label}
              </Chip>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
