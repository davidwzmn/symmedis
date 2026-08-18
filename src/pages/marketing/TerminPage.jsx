import { Abschnitt } from './parts.jsx'
import { LeadForm } from './LeadForm.jsx'
import { TERMIN } from '../../content/marketing.js'
import { IconCheck, IconShield } from '../../components/ui/Icons.jsx'

export function TerminPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#07101d] text-white">
        <div aria-hidden="true" className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 15% 15%, rgba(94,129,255,.25), transparent 30%), radial-gradient(circle at 88% 58%, rgba(83,224,189,.13), transparent 28%)' }} />
        <div className="shell-container relative py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/80">{TERMIN.label}</p>
              <h1 className="mt-4 text-[2.55rem] font-semibold leading-[1.01] tracking-[-0.045em] text-white sm:text-[3.45rem]">Bringen Sie die Wachstumsfrage. Wir bringen die Diagnoseperspektive.</h1>
            </div>
            <div>
              <p className="max-w-2xl text-[1rem] leading-7 text-white/65">{TERMIN.text}</p>
              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {['15 Minuten', 'keine Verkaufspräsentation', 'klare nächste Empfehlung'].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[0.72rem] leading-relaxed text-white/65">
                    <IconCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-200" />{item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-[0.75rem] leading-relaxed text-white/52">
            <IconShield className="mt-0.5 size-4 shrink-0 text-emerald-200" />
            Für den Erstkontakt brauchen wir keine Patienten-, Gesundheits- oder besonders sensiblen personenbezogenen Daten. Geschäftlicher Kontext genügt.
          </div>
        </div>
      </section>

      <Abschnitt hell>
        <LeadForm />
      </Abschnitt>
    </>
  )
}
