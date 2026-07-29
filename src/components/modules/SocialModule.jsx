import { useState } from 'react'
import { cn } from '../../lib/cn.js'
import { formatNumber } from '../../lib/format.js'
import { scoreStufe, tone } from '../../lib/tone.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, Banner, EmptyState, MetricCard } from '../ui/layout.jsx'
import { Drawer } from '../ui/overlays.jsx'
import { Sparkline, BarList, ScoreBar } from '../viz/charts.jsx'
import {
  IconAlert,
  IconCheckCircle,
  IconLink,
  IconPulse,
  IconShare,
  IconSparkles,
  IconTarget,
} from '../ui/Icons.jsx'

/**
 * Social-Media-Analyse.
 *
 * Wichtig: es werden keine Live-Integrationen vorgetäuscht. Angezeigt wird ein
 * gekennzeichneter Demo-Datenstand; die Connector-Schnittstelle ist vorbereitet,
 * aber sichtbar als „nicht verbunden“ ausgewiesen.
 */
export function SocialModule({ kunde, rolle = 'kunde' }) {
  const [detail, setDetail] = useState(null)
  const social = kunde.social
  const verbunden = social.plattformen.filter((p) => p.verbunden)
  const offen = social.plattformen.filter((p) => !p.verbunden)

  return (
    <div className="min-w-0 space-y-5">
      <Banner toneName="neutral" icon={IconLink} title="Datenquelle">
        Ausgewertet werden öffentlich sichtbare Beiträge der letzten 90 Tage (Demo-Datenstand).
        Für eine laufende Auswertung werden die Kanäle über die Connector-Schnittstelle verbunden –
        in dieser Demo ist keine Plattform tatsächlich angebunden.
      </Banner>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Kanalreife gesamt"
          value={social.gesamt}
          unit="/ 100"
          icon={IconShare}
          toneName={scoreStufe(social.gesamt).tone}
          hint={scoreStufe(social.gesamt).label}
        />
        <MetricCard
          label="Beiträge pro Woche"
          value={social.frequenz.toString().replace('.', ',')}
          icon={IconPulse}
          toneName="brand"
          hint={social.frequenz < 2 ? 'unter der Wirkschwelle' : 'ausreichend regelmäßig'}
        />
        <MetricCard
          label="Interaktionsrate"
          value={`${social.engagement.toString().replace('.', ',')} %`}
          icon={IconTarget}
          toneName="accent"
          hint="Mittel über alle verbundenen Kanäle"
        />
        <MetricCard
          label="Beiträge mit Handlungsaufforderung"
          value={`${social.ctaNutzung} %`}
          icon={IconAlert}
          toneName={social.ctaNutzung < 40 ? 'warn' : 'ok'}
          hint={social.ctaNutzung < 40 ? 'Reichweite ohne Anschluss' : 'Anschluss vorhanden'}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title="Kanäle im Vergleich"
            subtitle="Reifegrad je Kanal – Länge trägt den Vergleich, nicht die Farbe"
          />
          <CardBody className="px-0 py-0">
            <ul className="divide-y divide-line">
              {[...verbunden]
                .sort((a, b) => b.score - a.score)
                .map((plattform) => (
                  <li key={plattform.id}>
                    <button
                      type="button"
                      onClick={() => setDetail(plattform.id)}
                      className="w-full px-4 py-3.5 text-left transition-colors hover:bg-surface-muted sm:px-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <ScoreBar
                            score={plattform.score}
                            label={plattform.label}
                            sublabel={`${plattform.frequenz.toString().replace('.', ',')} Beiträge/Woche · ${plattform.engagement.toString().replace('.', ',')} % Interaktion${
                              plattform.follower ? ` · ${formatNumber(plattform.follower)} Follower` : ''
                            }`}
                          />
                        </div>
                        <div className="hidden w-24 shrink-0 text-ink-3 sm:block">
                          <Sparkline
                            values={plattform.verlauf}
                            toneName="brand"
                            label={`Verlauf ${plattform.label}, aktuell ${plattform.score}`}
                          />
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
            </ul>

            {offen.length > 0 ? (
              <div className="border-t border-line px-4 py-4 sm:px-5">
                <p className="text-xs font-semibold text-ink-2">Nicht verbundene Kanäle</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {offen.map((plattform) => (
                    <Chip key={plattform.id} toneName="neutral" icon={IconLink}>
                      {plattform.label} · nicht verbunden
                    </Chip>
                  ))}
                </div>
                <p className="mt-2.5 text-xs text-ink-3">
                  Für diese Kanäle liegen keine Daten vor. Es werden bewusst keine Werte geschätzt.
                </p>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Reichweite je Kanal" subtitle="Follower, absteigend" />
            <CardBody>
              {verbunden.filter((p) => p.follower > 0).length === 0 ? (
                <EmptyState
                  compact
                  icon={IconShare}
                  title="Keine Reichweitendaten"
                  description="Für Fachmedien wird keine Followerzahl geführt."
                />
              ) : (
                <BarList
                  items={verbunden
                    .filter((p) => p.follower > 0)
                    .map((p) => ({
                      label: p.label,
                      value: p.follower,
                      display: formatNumber(p.follower),
                    }))}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Konsistenz" subtitle="Einheitlichkeit der Kernaussage über alle Kanäle" />
            <CardBody>
              <div className="flex items-baseline justify-between">
                <span className="text-[0.8125rem] text-ink-2">Übereinstimmung</span>
                <span className="tabular text-2xl font-semibold text-ink">{social.konsistenz} %</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-viz-track">
                <div
                  className={cn('h-full rounded-full', tone(scoreStufe(social.konsistenz).tone).bar)}
                  style={{ width: `${social.konsistenz}%` }}
                />
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-2">
                Gemessen wird, wie stark Profiltexte, Beitragsaussagen und Website dieselbe
                Kernaussage tragen.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader title="Erkannte Lücken" subtitle="Was systematisch fehlt" icon={IconAlert} />
          <CardBody className="py-0 px-0">
            {social.luecken.length === 0 ? (
              <EmptyState
                compact
                icon={IconCheckCircle}
                title="Keine strukturellen Lücken"
                description="Die Kanäle tragen die Kernaussage durchgängig."
              />
            ) : (
              <ul className="divide-y divide-line">
                {social.luecken.map((luecke) => (
                  <li key={luecke} className="flex items-start gap-2.5 px-4 py-3 sm:px-5">
                    <IconAlert className="mt-0.5 size-4 shrink-0 text-warn-ink" />
                    <span className="text-[0.8125rem] leading-relaxed text-ink">{luecke}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Sofort umsetzbar"
            subtitle="Maßnahmen ohne Vorlauf"
            icon={IconSparkles}
          />
          <CardBody className="py-0 px-0">
            <ul className="divide-y divide-line">
              {social.quickWins.map((win) => (
                <li key={win} className="flex items-start gap-2.5 px-4 py-3 sm:px-5">
                  <IconCheckCircle className="mt-0.5 size-4 shrink-0 text-ok-ink" />
                  <span className="text-[0.8125rem] leading-relaxed text-ink">{win}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <PlattformDetail
        plattform={social.plattformen.find((p) => p.id === detail)}
        rolle={rolle}
        onClose={() => setDetail(null)}
      />
    </div>
  )
}

function PlattformDetail({ plattform, rolle, onClose }) {
  if (!plattform) return null
  const stufe = scoreStufe(plattform.score)

  return (
    <Drawer
      open
      onClose={onClose}
      title={plattform.label}
      subtitle="Kanalauswertung der letzten 90 Tage (Demo-Datenstand)"
      footer={
        <p className="text-xs text-ink-3">
          {rolle === 'intern'
            ? 'Bewertung durch S. Brandt geprüft · Grundlage: öffentlich sichtbare Beiträge'
            : 'Auswertung durch das SYMMEDIS-Team geprüft'}
        </p>
      }
    >
      <div className="space-y-5 px-5 py-5">
        <div className="flex flex-wrap gap-2">
          <Chip toneName={stufe.tone}>{stufe.label}</Chip>
          <Chip toneName="neutral">Reifegrad {plattform.score}</Chip>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Beiträge / Woche', wert: plattform.frequenz.toString().replace('.', ',') },
            { label: 'Interaktionsrate', wert: `${plattform.engagement.toString().replace('.', ',')} %` },
            {
              label: 'Follower',
              wert: plattform.follower ? formatNumber(plattform.follower) : 'nicht geführt',
            },
            { label: 'Status', wert: plattform.verbunden ? 'Daten vorhanden' : 'nicht verbunden' },
          ].map((kennzahl) => (
            <div key={kennzahl.label} className="rounded-lg border border-line bg-surface-muted p-3">
              <p className="text-xs text-ink-3">{kennzahl.label}</p>
              <p className="tabular mt-0.5 text-[0.9375rem] font-semibold text-ink">{kennzahl.wert}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-ink-2">Verlauf der letzten acht Wochen</h3>
          <div className="mt-2 rounded-lg border border-line p-3 text-brand-ink">
            <Sparkline
              values={plattform.verlauf}
              width={280}
              height={64}
              label={`Verlauf ${plattform.label}`}
            />
          </div>
          <p className="mt-1.5 text-xs text-ink-3">
            Werte {Math.min(...plattform.verlauf)} bis {Math.max(...plattform.verlauf)} · aktuell{' '}
            {plattform.verlauf[plattform.verlauf.length - 1]}
          </p>
        </div>

        <div className="rounded-lg border border-line bg-surface-muted p-4">
          <h3 className="text-xs font-semibold text-ink-2">Einordnung</h3>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink">
            {plattform.frequenz < 1.5
              ? 'Die Frequenz liegt unter der Schwelle, ab der ein Kanal überhaupt Wirkung entfalten kann. Reichweite entsteht hier nicht durch bessere Inhalte, sondern zuerst durch Regelmäßigkeit.'
              : plattform.engagement < 2
                ? 'Die Frequenz stimmt, die Resonanz nicht. Das deutet auf Inhalte hin, die informieren, aber keinen Anlass zur Reaktion geben.'
                : 'Frequenz und Resonanz tragen. Der Hebel liegt darin, die vorhandene Aufmerksamkeit in konkrete Anfragen zu überführen.'}
          </p>
        </div>
      </div>
    </Drawer>
  )
}

/** Kompakte Social-Kachel für Dashboards. */
export function SocialUeberblick({ kunde, onOeffnen }) {
  const social = kunde.social
  const verbunden = social.plattformen.filter((p) => p.verbunden)

  return (
    <Card>
      <CardHeader
        title="Social-Media-Analyse"
        subtitle={`${verbunden.length} von ${social.plattformen.length} Kanälen ausgewertet`}
        icon={IconShare}
        action={
          onOeffnen ? (
            <Button variant="ghost" size="sm" onClick={onOeffnen}>
              Ansehen
            </Button>
          ) : null
        }
      />
      <CardBody>
        <BarList
          items={verbunden.map((p) => ({ label: p.label, value: p.score }))}
          max={100}
        />
      </CardBody>
    </Card>
  )
}
