import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn.js'
import { FREIGABE } from '../../lib/tone.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Card } from '../../components/ui/layout.jsx'
import { SeitenKopf, Abschnitt, CtaBand } from './parts.jsx'
import { FUNKTIONSWEISE } from '../../content/marketing.js'
import { IconArrowRight, IconShield } from '../../components/ui/Icons.jsx'

const FREIGABE_REIHE = ['vorgeschlagen', 'pruefung', 'bearbeitet', 'intern', 'kunde']

export function FunktionsweisePage() {
  return (
    <>
      <SeitenKopf eyebrow={FUNKTIONSWEISE.label} titel={FUNKTIONSWEISE.headline} text={FUNKTIONSWEISE.text} />

      <Abschnitt
        eyebrow="In vier Schritten"
        headline="Von der Vermutung zur belegten Klarheit"
        text="Die Software strukturiert und dokumentiert jeden Schritt. Die Bewertung und Einordnung nimmt immer das SYMMEDIS-Team vor."
        hell
      >
        <ol className="grid gap-4 md:grid-cols-2">
          {FUNKTIONSWEISE.schritte.map((schritt) => (
            <li key={schritt.nummer}>
              <Card className="flex h-full flex-col p-5 sm:p-6">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-on-brand">
                  {schritt.nummer}
                </span>
                <h3 className="mt-3.5 text-[1.0625rem] font-semibold text-ink">{schritt.titel}</h3>
                <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-2">
                  {schritt.text}
                </p>
                <div className="mt-3.5 border-t border-line pt-3.5">
                  <Chip size="sm" toneName={schritt.traeger.startsWith('Team') ? 'accent' : 'neutral'}>
                    {schritt.traeger}
                  </Chip>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </Abschnitt>

      <Abschnitt
        eyebrow="Software strukturiert, Menschen entscheiden"
        headline="Der Freigabeprozess ist Teil des Produkts"
        text="Jeder Bewertungsvorschlag durchläuft fünf Stufen. Nichts wird automatisch veröffentlicht oder an Sie versendet – die menschliche Prüfung ist kein nachträglicher Schritt, sondern eingebaut."
      >
        <div className="scroll-area overflow-x-auto">
          <ol className="flex min-w-max items-stretch gap-3">
            {FREIGABE_REIHE.map((key, index) => (
              <li key={key} className="flex items-center gap-3">
                <div className="w-44 rounded-card border border-line bg-surface p-4">
                  <span className="text-xs font-semibold text-ink-3">Stufe {index + 1}</span>
                  <p className="mt-1.5 text-[0.875rem] font-semibold text-ink">{FREIGABE[key].label}</p>
                  <div className="mt-2.5">
                    <Chip size="sm" toneName={FREIGABE[key].tone}>
                      {FREIGABE[key].kurz}
                    </Chip>
                  </div>
                </div>
                {index < FREIGABE_REIHE.length - 1 ? (
                  <IconArrowRight className="size-4 shrink-0 text-ink-3" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <Card className="mt-8 border-brand-border bg-brand-softer p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand')}>
              <IconShield className="size-5" />
            </span>
            <div>
              <h3 className="text-[0.9375rem] font-semibold text-ink">
                Interne Notizen bleiben intern
              </h3>
              <p className="mt-1 text-[0.875rem] leading-relaxed text-ink-2">
                Zwischenstände, Notizen und noch nicht freigegebene Bewertungen erscheinen nie im
                Kundenportal und in keinem Export. Erst mit der letzten Stufe wird ein Punkt für Sie
                sichtbar.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-8">
          <Button as={Link} to="/plattform" variant="secondary">
            Wie die Plattform das abbildet
            <IconArrowRight className="size-4" />
          </Button>
        </div>
      </Abschnitt>

      <CtaBand
        titel="Am Ende steht ein 90-Tage-Plan – kein Foliensatz"
        text="Sie erhalten eine belegte Ursachenanalyse, die drei größten Umsatzbremsen und einen konkreten Umsetzungsplan."
        primaer={{ to: '/termin', label: 'Gespräch anfragen' }}
        sekundaer={{ to: '/angebot', label: 'Zum Angebot' }}
      />
    </>
  )
}
