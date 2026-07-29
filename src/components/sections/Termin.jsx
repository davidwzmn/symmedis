import { useRef, useState } from 'react'
import { TERMIN } from '../../content/site.js'
import { useInbox } from '../../hooks/useInbox.js'
import { useToast } from '../../hooks/useToast.js'
import { Button } from '../ui/Button.jsx'
import { Field, controlBorder, controlBorderError, controlClasses } from '../ui/Field.jsx'
import { IconArrowRight, IconCheck } from '../ui/Icons.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { Spinner } from '../ui/Spinner.jsx'

const LEER = { name: '', email: '', firma: '', nachricht: '' }
const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

function validate(values) {
  const errors = {}
  if (values.name.trim().length < 2) {
    errors.name = 'Bitte geben Sie Ihren Namen an.'
  }
  if (!EMAIL_MUSTER.test(values.email.trim())) {
    errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  }
  if (values.nachricht.trim().length > 1200) {
    errors.nachricht = 'Bitte fassen Sie sich etwas kürzer (max. 1200 Zeichen).'
  }
  return errors
}

export function Termin({ onOpenDemo }) {
  const [values, setValues] = useState(LEER)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const formRef = useRef(null)
  const toast = useToast()
  const { addFormRequest } = useInbox()

  const update = (field) => (event) => {
    const { value } = event.target
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return

    const nextErrors = validate(values)
    setErrors(nextErrors)

    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      formRef.current?.querySelector(`#termin-${firstError}`)?.focus()
      toast.show({
        title: 'Bitte prüfen Sie Ihre Eingaben',
        description: 'Ein Pflichtfeld ist noch nicht vollständig ausgefüllt.',
        variant: 'error',
      })
      return
    }

    setStatus('sending')
    // Demo-Übertragung: kein echter Versand, nur simulierte Latenz.
    await new Promise((resolve) => setTimeout(resolve, 850))

    addFormRequest(values)
    setStatus('sent')
    toast.show({
      title: 'Anfrage erfasst (Demo)',
      description: 'Sie erscheint sofort im internen Posteingang der Mitarbeiteransicht.',
      variant: 'success',
    })
  }

  const reset = () => {
    setValues(LEER)
    setErrors({})
    setStatus('idle')
    window.requestAnimationFrame(() => formRef.current?.querySelector('#termin-name')?.focus())
  }

  return (
    <section id="termin" aria-labelledby="termin-headline" className="py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal as="p" className="eyebrow">
              {TERMIN.label}
            </Reveal>
            <Reveal
              as="h2"
              delay={60}
              id="termin-headline"
              className="mt-4 max-w-xl text-[1.75rem] leading-[1.2] sm:text-[2.125rem]"
            >
              {TERMIN.headline}
            </Reveal>
            <Reveal
              as="p"
              delay={120}
              className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed prose-muted"
            >
              {TERMIN.text}
            </Reveal>

            <Reveal delay={180} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                size="lg"
                onClick={() =>
                  formRef.current?.querySelector('#termin-name')?.focus({ preventScroll: false })
                }
              >
                {TERMIN.ctaPrimary}
              </Button>
              <Button size="lg" variant="secondary" onClick={onOpenDemo}>
                {TERMIN.ctaSecondary}
                <IconArrowRight className="size-4.5" />
              </Button>
            </Reveal>

            <Reveal
              delay={240}
              className="mt-10 border-l-2 border-brass-400 pl-5 dark:border-brass-500"
            >
              <p className="text-[0.9375rem] leading-relaxed prose-muted">
                Im Gespräch hören wir zu, spiegeln Ihre Situation und sagen Ihnen ehrlich, ob eine
                Ursachenanalyse für Sie sinnvoll ist. Wir verkaufen nichts – wir diagnostizieren.
              </p>
            </Reveal>
          </div>

          <Reveal delay={100}>
            <div className="surface p-6 sm:p-8">
              {status === 'sent' ? (
                <div className="py-2 text-center">
                  <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-marine-800 text-white dark:bg-marine-400 dark:text-night-950">
                    <IconCheck className="size-6" strokeWidth={2} />
                  </span>
                  <h3 className="mt-5 text-lg">Vielen Dank, {values.name.split(' ')[0]}.</h3>
                  <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed prose-muted">
                    Ihre Anfrage wurde in dieser Beta-Demo erfasst – es wurde nichts versendet und
                    nichts gespeichert. In der Mitarbeiteransicht können Sie sie direkt als neuen
                    Eingang sehen und beantworten.
                  </p>
                  <Button variant="secondary" className="mt-6" onClick={reset}>
                    Weitere Anfrage stellen
                  </Button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate>
                  <h3 className="text-base font-medium tracking-wide text-marine-900 dark:text-night-100">
                    Kurzes Formular
                  </h3>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed prose-muted">
                    Beta-Demo: Ihre Eingaben verlassen den Browser nicht und werden nicht
                    gespeichert.
                  </p>

                  <div className="mt-6 space-y-5">
                    <Field id="termin-name" label="Name" required error={errors.name}>
                      {({ errorId }) => (
                        <input
                          id="termin-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={values.name}
                          onChange={update('name')}
                          aria-invalid={errors.name ? 'true' : undefined}
                          aria-describedby={errorId}
                          className={`${controlClasses} ${errors.name ? controlBorderError : controlBorder}`}
                          placeholder="Vor- und Nachname"
                        />
                      )}
                    </Field>

                    <Field id="termin-email" label="E-Mail" required error={errors.email}>
                      {({ errorId }) => (
                        <input
                          id="termin-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={values.email}
                          onChange={update('email')}
                          aria-invalid={errors.email ? 'true' : undefined}
                          aria-describedby={errorId}
                          className={`${controlClasses} ${errors.email ? controlBorderError : controlBorder}`}
                          placeholder="name@unternehmen.de"
                        />
                      )}
                    </Field>

                    <Field id="termin-firma" label="Firma">
                      {() => (
                        <input
                          id="termin-firma"
                          name="firma"
                          type="text"
                          autoComplete="organization"
                          value={values.firma}
                          onChange={update('firma')}
                          className={`${controlClasses} ${controlBorder}`}
                          placeholder="Unternehmensname"
                        />
                      )}
                    </Field>

                    <Field
                      id="termin-nachricht"
                      label="Kurze Nachricht"
                      hint="Woran hakt es aktuell? Zwei bis drei Sätze genügen."
                      error={errors.nachricht}
                    >
                      {({ hintId, errorId }) => (
                        <textarea
                          id="termin-nachricht"
                          name="nachricht"
                          rows={4}
                          value={values.nachricht}
                          onChange={update('nachricht')}
                          aria-invalid={errors.nachricht ? 'true' : undefined}
                          aria-describedby={errorId ?? hintId}
                          className={`${controlClasses} resize-y ${errors.nachricht ? controlBorderError : controlBorder}`}
                          placeholder="Unser Marketing läuft, aber der Umsatz entwickelt sich nicht entsprechend …"
                        />
                      )}
                    </Field>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    className="mt-7"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? (
                      <Spinner label="Wird gesendet …" />
                    ) : (
                      '15-Minuten-Diagnosegespräch anfragen'
                    )}
                  </Button>

                  <p className="mt-3 text-center text-[0.75rem] prose-muted">
                    Mit * markierte Felder sind Pflichtfelder.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
