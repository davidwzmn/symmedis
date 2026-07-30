import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Card } from '../../components/ui/layout.jsx'
import { SeitenKopf, Abschnitt, CtaBand, MarketingBild } from './parts.jsx'
import { MITARBEITERPORTAL, KUNDENPORTAL, PLAN, PLATTFORM, SOCIAL, VISUALS } from '../../content/marketing.js'
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconLock,
  IconRoute,
  IconShare,
  IconUsers,
} from '../../components/ui/Icons.jsx'

const PORTALE = [
  { daten: KUNDENPORTAL, icon: IconUsers, ton: 'brand', ziel: '/login?rolle=kunde', cta: 'Kundenportal ansehen' },
  { daten: MITARBEITERPORTAL, icon: IconLock, ton: 'accent', ziel: '/login?rolle=intern', cta: 'Mitarbeiterportal ansehen' },
]

export function PlattformPage() {
  return (
    <>
      <SeitenKopf
        eyebrow={PLATTFORM.label}
        titel={PLATTFORM.headline}
        text={PLATTFORM.text}
        aktionen={
          <>
            <Button as={Link} to="/demo" size="lg">
              Produktdemo öffnen
              <IconArrowRight className="size-4" />
            </Button>
            <Button as={Link} to="/login" variant="secondary" size="lg">
              Portalzugang testen
            </Button>
          </>
        }
      />

      {/* Module */}
      <Abschnitt
        eyebrow="Module"
        headline="Alles an einem Ort statt Bericht per E-Mail"
        text="Analyse, Freigabe, Aufgaben, Dokumente und Abstimmung laufen in einer Anwendung – für Sie und für uns."
        hell
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PLATTFORM.module.map((modul) => (
            <Card key={modul.titel} className="p-5">
              <h3 className="text-[0.9375rem] font-semibold text-ink">{modul.titel}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{modul.text}</p>
            </Card>
          ))}
        </div>

        <MarketingBild visual={VISUALS.plattform} className="mt-8" />
      </Abschnitt>

      {/* Portale */}
      <Abschnitt
        eyebrow="Zwei Portale, eine Wahrheit"
        headline="Was Sie sehen – und was intern bleibt"
        text="Das Kundenportal zeigt ausschließlich geprüfte und freigegebene Inhalte. Das Mitarbeiterportal enthält zusätzlich den Analyse-Editor, den Freigabeprozess und interne Notizen."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {PORTALE.map(({ daten, icon: Icon, ton, ziel, cta }) => (
            <Card key={daten.label} className="flex flex-col p-6 sm:p-7">
              <span
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-xl',
                  ton === 'brand' ? 'bg-brand-soft text-brand-ink' : 'bg-accent-soft text-accent-ink',
                )}
              >
                <Icon className="size-5" />
              </span>
              <p className="eyebrow mt-4">{daten.label}</p>
              <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">{daten.headline}</h3>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-2">{daten.text}</p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {daten.punkte.map((punkt) => (
                  <li key={punkt} className="flex items-start gap-2.5 text-[0.8125rem] text-ink">
                    <IconCheck
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        ton === 'brand' ? 'text-brand-ink' : 'text-accent-ink',
                      )}
                    />
                    {punkt}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Button as={Link} to={ziel} variant="secondary" size="sm">
                  {cta}
                  <IconArrowRight className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-warn-border p-5">
          <div className="flex items-start gap-3">
            <IconAlert className="mt-0.5 size-5 shrink-0 text-warn-ink" />
            <p className="text-[0.875rem] leading-relaxed text-ink-2">
              <span className="font-semibold text-ink">Strikte Trennung: </span>
              Interne Notizen, Entwürfe und Bewertungen im Zwischenstand erscheinen nie im
              Kundenportal – auch nicht in Exporten. Jedes Projekt ist ein eigener Mandant.
            </p>
          </div>
        </Card>
      </Abschnitt>

      {/* Social */}
      <Abschnitt
        eyebrow={SOCIAL.label}
        headline={SOCIAL.headline}
        text={SOCIAL.text}
        hell
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SOCIAL.kriterien.map((kriterium, index) => (
            <Card key={kriterium.titel} className="p-5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                  <IconShare className="size-4" />
                </span>
                <span className="tabular text-xs font-semibold text-ink-3">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-3.5 text-[0.9375rem] font-semibold text-ink">{kriterium.titel}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{kriterium.text}</p>
            </Card>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-[0.8125rem] leading-relaxed text-ink-3">
          Ausgewertet werden öffentlich sichtbare Beiträge der letzten 90 Tage. Für eine laufende
          Auswertung lassen sich Kanäle über vorbereitete Connector-Schnittstellen anbinden – es
          wird keine Live-Integration vorgetäuscht.
        </p>
      </Abschnitt>

      {/* 90-Tage-Plan */}
      <Abschnitt eyebrow={PLAN.label} headline={PLAN.headline} text={PLAN.text}>
        <ol className="grid gap-4 lg:grid-cols-3">
          {PLAN.phasen.map((phase, index) => (
            <li key={phase.label}>
              <Card className="flex h-full flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <Chip toneName="brand" icon={IconRoute}>
                    {phase.label}
                  </Chip>
                  <span className="tabular text-xs font-semibold text-ink-3">Phase {index + 1}/3</span>
                </div>
                <h3 className="mt-3.5 text-[1.0625rem] font-semibold text-ink">{phase.ziel}</h3>
                <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-2">{phase.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Abschnitt>

      <CtaBand
        titel="Am besten klicken Sie sich selbst durch"
        text="Die Produktdemo läuft ohne Anmeldung mit einem gekennzeichneten Beispielprojekt. Für die Portalsicht genügt ein beliebiger Demo-Login."
        primaer={{ to: '/demo', label: 'Produktdemo öffnen' }}
        sekundaer={{ to: '/login', label: 'Portalzugang testen' }}
      />
    </>
  )
}
