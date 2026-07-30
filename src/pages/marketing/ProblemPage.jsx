import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/primitives.jsx'
import { Card } from '../../components/ui/layout.jsx'
import { SeitenKopf, Abschnitt, CtaBand } from './parts.jsx'
import { PROBLEM, UEBER_UNS } from '../../content/marketing.js'
import { IconArrowRight } from '../../components/ui/Icons.jsx'

export function ProblemPage() {
  return (
    <>
      <SeitenKopf eyebrow={PROBLEM.label} titel={PROBLEM.headline} text={PROBLEM.text} />

      <Abschnitt
        eyebrow="Die vier häufigsten Ursachen"
        headline="Vier Muster, die Wachstum blockieren"
        text="In fast jedem stagnierenden Projekt findet sich mindestens eines dieser Muster. Sie erzeugen Symptome, die man leicht für das eigentliche Problem hält."
        hell
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {PROBLEM.karten.map((karte, index) => (
            <Card key={karte.titel} className="flex flex-col p-5 sm:p-6">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-surface-inverse text-xs font-semibold text-canvas">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3.5 text-[1.0625rem] font-semibold text-ink">{karte.titel}</h3>
              <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-ink-2">{karte.text}</p>
              <p className="mt-3.5 border-t border-line pt-3.5 text-[0.8125rem] leading-snug text-ink-3">
                {karte.symptom}
              </p>
            </Card>
          ))}
        </div>
      </Abschnitt>

      <Abschnitt
        eyebrow="Ursache statt Symptom"
        headline="Warum mehr Marketing die Lage oft verschärft"
        text="Marketing macht Bestehendes sichtbarer – auch eine unscharfe Positionierung oder eine schwer verständliche Nutzenargumentation. Wer an der falschen Stelle mehr Budget einsetzt, verstärkt das Problem, statt es zu lösen."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {UEBER_UNS.prinzipien.map((prinzip) => (
            <Card key={prinzip.titel} className="p-5">
              <h3 className="text-[0.9375rem] font-semibold text-ink">{prinzip.titel}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{prinzip.text}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Button as={Link} to="/funktionsweise" variant="secondary">
            So finden wir die Ursache
            <IconArrowRight className="size-4" />
          </Button>
        </div>
      </Abschnitt>

      <CtaBand
        titel="Ursache oder Symptom? Das klären wir in 15 Minuten"
        text="Schildern Sie kurz Ihre Situation. Wir sagen Ihnen, ob eine Ursachenanalyse in Ihrem Fall sinnvoll ist – und wenn nicht, auch das."
        sekundaer={{ to: '/analysebereiche', label: 'Analysebereiche ansehen' }}
      />
    </>
  )
}
