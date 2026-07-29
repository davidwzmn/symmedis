import { cn } from '../../lib/cn.js'
import { KATEGORIE_MAP } from '../../data/catalog.js'
import { scoreStufe, tone } from '../../lib/tone.js'
import { Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, Banner } from '../ui/layout.jsx'
import { IconInfo, IconLayers, IconTarget } from '../ui/Icons.jsx'

/**
 * Positionierungs- und Wettbewerbsvergleich.
 *
 * Bewusst als Tabelle mit Balken statt als Streudiagramm: die Aussage ist ein
 * Größenvergleich über vier Dimensionen, kein Zusammenhang zweier Größen.
 * Jeder Wert ist direkt beschriftet, die Farbe kodiert nur die Bewertungsstufe
 * und steht nie allein.
 */
export function CompetitionModule({ kunde }) {
  const { dimensionen, anbieter, beobachtung } = kunde.wettbewerb
  const eigen = anbieter.find((a) => a.eigen)

  const mittel = dimensionen.map((_, i) =>
    Math.round(
      anbieter.filter((a) => !a.eigen).reduce((sum, a) => sum + a.werte[i], 0) /
        (anbieter.length - 1),
    ),
  )

  return (
    <div className="space-y-5">
      <Banner toneName="neutral" icon={IconInfo} title="Vergleichsgrundlage">
        Bewertet werden öffentlich zugängliche Aussagen der Anbieter – Website, Vertriebsunterlagen
        und Fachbeiträge. Die genannten Wettbewerber sind für diese Demo fiktiv.
      </Banner>

      <Card>
        <CardHeader
          title="Position im Wettbewerbsumfeld"
          subtitle="Vier Dimensionen, Reifegrad 0–100"
          icon={IconLayers}
        />
        <CardBody className="px-0 py-0">
          <div className="scroll-area overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-sm">
              <caption className="sr-only">
                Vergleich von {kunde.kurz} mit drei Wettbewerbern über vier Analysedimensionen
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-ink-2 sm:px-5">
                    Anbieter
                  </th>
                  {dimensionen.map((id) => (
                    <th
                      key={id}
                      scope="col"
                      className="px-3 py-2.5 text-left text-xs font-semibold text-ink-2"
                    >
                      {KATEGORIE_MAP[id].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {anbieter.map((eintrag) => (
                  <tr
                    key={eintrag.id}
                    className={cn(
                      'border-b border-line last:border-0',
                      eintrag.eigen && 'bg-brand-softer',
                    )}
                  >
                    <th scope="row" className="px-4 py-3 text-left align-middle sm:px-5">
                      <span className="flex items-center gap-2">
                        <span className="text-[0.8125rem] font-medium text-ink">{eintrag.name}</span>
                        {eintrag.eigen ? (
                          <Chip size="sm" toneName="brand">
                            Ihr Unternehmen
                          </Chip>
                        ) : null}
                      </span>
                    </th>
                    {eintrag.werte.map((wert, i) => {
                      const stufe = scoreStufe(wert)
                      return (
                        <td key={dimensionen[i]} className="px-3 py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="tabular w-7 shrink-0 text-[0.8125rem] font-semibold text-ink">
                              {wert}
                            </span>
                            <span className="h-1.5 w-full max-w-24 overflow-hidden rounded-full bg-viz-track">
                              <span
                                className={cn(
                                  'block h-full rounded-full',
                                  eintrag.eigen ? tone(stufe.tone).bar : 'bg-neutral',
                                )}
                                style={{ width: `${wert}%` }}
                              />
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader title="Abstand zum Marktmittel" icon={IconTarget} />
          <CardBody className="space-y-3.5">
            {dimensionen.map((id, i) => {
              const differenz = eigen.werte[i] - mittel[i]
              const vorn = differenz >= 0
              return (
                <div key={id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.8125rem] text-ink">{KATEGORIE_MAP[id].label}</span>
                    <span
                      className={cn(
                        'tabular text-[0.8125rem] font-semibold',
                        vorn ? 'text-ok-ink' : 'text-urgent-ink',
                      )}
                    >
                      {vorn ? '+' : ''}
                      {differenz} Punkte
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-3">
                    {kunde.kurz} {eigen.werte[i]} · Marktmittel {mittel[i]} ·{' '}
                    {vorn ? 'Vorsprung' : 'Rückstand'}
                  </p>
                </div>
              )
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Einordnung durch das Team" />
          <CardBody>
            <p className="text-[0.875rem] leading-relaxed text-ink">{beobachtung}</p>
            <p className="mt-3 border-t border-line pt-3 text-xs text-ink-3">
              Geprüft und formuliert von {kunde.betreuerId === 'mr' ? 'M. Reinhardt' : 'dem SYMMEDIS-Team'}.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
