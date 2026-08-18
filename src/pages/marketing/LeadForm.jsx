import { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitWebsiteLead } from '../../lib/supabase.js'
import { Button } from '../../components/ui/primitives.jsx'
import { Card, CardBody } from '../../components/ui/layout.jsx'
import { IconCalendar, IconCheck, IconShield } from '../../components/ui/Icons.jsx'
import { TERMIN } from '../../content/marketing.js'

const BOOKING_URL = import.meta.env.VITE_BOOKING_URL || ''
const INITIAL = { name: '', company: '', email: '', situation: '', website: '' }

export function LeadForm() {
  const [form, setForm] = useState(INITIAL)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setStatus('sending')
    try {
      await submitWebsiteLead({ ...form, source: 'termin-page' })
      setStatus('sent')
      setForm(INITIAL)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Die Anfrage konnte gerade nicht gesendet werden.')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
      <Card className="overflow-hidden border-brand-border bg-brand-softer">
        <CardBody className="p-6 sm:p-8">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand text-on-brand"><IconCalendar className="size-5" /></span>
          <p className="eyebrow mt-6">15 Minuten. Klarheit statt Pitch.</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">Was wir im ersten Gespräch klären</h2>
          <ol className="mt-6 space-y-4">
            {TERMIN.ablauf.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-brand-border bg-surface text-xs font-semibold text-brand-ink">{index + 1}</span>
                <span className="pt-1 text-[0.8125rem] leading-relaxed text-ink-2">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-7 rounded-xl border border-brand-border bg-surface/75 p-4">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-2"><IconShield className="mt-0.5 size-4 shrink-0 text-brand-ink" />Keine Patienten- oder Gesundheitsdaten. Für die erste Einschätzung genügen geschäftlicher Kontext und die aktuelle Wachstumsfrage.</p>
          </div>
        </CardBody>
      </Card>

      <Card className="shadow-lg shadow-black/5">
        <CardBody className="p-6 sm:p-8">
          {BOOKING_URL ? (
            <div className="flex min-h-80 flex-col justify-center">
              <p className="eyebrow">Direkte Terminwahl</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">Wählen Sie direkt einen freien Zeitpunkt.</h2>
              <p className="mt-3 max-w-xl text-[0.875rem] leading-relaxed text-ink-2">Der Buchungsdienst öffnet sich in einem neuen Tab. Alternativ können Sie uns jederzeit über die Kontaktdaten im Impressum erreichen.</p>
              <Button as="a" href={BOOKING_URL} target="_blank" rel="noopener noreferrer" variant="cta" size="lg" className="mt-6 self-start">15-Minuten-Gespräch buchen</Button>
            </div>
          ) : status === 'sent' ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-ok-soft text-ok-ink"><IconCheck className="size-6" /></span>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">Ihre Anfrage ist eingegangen.</h2>
              <p className="mt-3 max-w-md text-[0.875rem] leading-relaxed text-ink-2">Wir prüfen den Kontext persönlich und melden uns über die angegebene geschäftliche E-Mail-Adresse.</p>
              <Button variant="secondary" size="sm" className="mt-6" onClick={() => setStatus('idle')}>Weitere Anfrage senden</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <p className="eyebrow">Diagnosegespräch anfragen</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">Wo bleibt Wachstum gerade unter seinen Möglichkeiten?</h2>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">Zwei bis drei Sätze reichen. Wir melden uns nur, wenn wir einen sinnvollen nächsten Schritt sehen.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" value={form.name} onChange={set('name')} autoComplete="name" required />
                <Field label="Unternehmen" value={form.company} onChange={set('company')} autoComplete="organization" required />
              </div>
              <Field label="Geschäftliche E-Mail" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
              <div>
                <label htmlFor="lead-situation" className="mb-1.5 block text-[0.8125rem] font-medium text-ink">Aktuelle Situation <span className="font-normal text-ink-3">optional</span></label>
                <textarea id="lead-situation" rows={5} value={form.situation} onChange={set('situation')} maxLength={4000} placeholder="z. B. Marketinginvestitionen steigen, aber qualifizierte Anfragen stagnieren …" className="w-full resize-y rounded-xl border border-line-strong bg-surface px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition placeholder:text-ink-3/70 focus:border-brand focus:ring-2 focus:ring-brand-soft" />
              </div>

              <div className="absolute -left-[9999px] top-auto size-px overflow-hidden" aria-hidden="true">
                <label htmlFor="lead-website">Website</label>
                <input id="lead-website" tabIndex="-1" autoComplete="off" value={form.website} onChange={set('website')} />
              </div>

              {error ? <div role="alert" className="rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-[0.8125rem] text-danger-ink">{error}</div> : null}

              <Button type="submit" size="lg" variant="cta" fullWidth disabled={status === 'sending'}>{status === 'sending' ? 'Anfrage wird gesendet …' : '15-Minuten-Gespräch anfragen'}</Button>
              <p className="text-xs leading-relaxed text-ink-3">Mit dem Absenden übermitteln Sie die Angaben zur Bearbeitung Ihrer geschäftlichen Anfrage. Details finden Sie in unserer <Link to="/datenschutz" className="font-medium text-brand-ink underline underline-offset-2">Datenschutzerklärung</Link>.</p>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, autoComplete, required }) {
  const id = `lead-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.8125rem] font-medium text-ink">{label}{required ? <span className="ml-1 text-danger-ink">*</span> : null}</label>
      <input id={id} type={type} value={value} onChange={onChange} required={required} autoComplete={autoComplete} className="h-11 w-full rounded-xl border border-line-strong bg-surface px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-3/70 focus:border-brand focus:ring-2 focus:ring-brand-soft" />
    </div>
  )
}
