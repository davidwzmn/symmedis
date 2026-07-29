import { useCallback, useEffect, useRef, useState } from 'react'
import { BRANCHEN } from '../../lib/analysis.js'
import { ApiError, requestAnalysis } from '../../lib/api.js'
import { scrollToSection } from '../../lib/scroll.js'
import { useToast } from '../../hooks/useToast.js'
import { Button } from '../ui/Button.jsx'
import { Field, controlBorder, controlBorderError, controlClasses } from '../ui/Field.jsx'
import { IconAlert, IconArrowRight, IconCheck, IconRefresh, IconSparkles } from '../ui/Icons.jsx'
import { Modal } from '../ui/Modal.jsx'
import { Spinner } from '../ui/Spinner.jsx'
import { AnalysisResult } from './AnalysisResult.jsx'

const SCHRITTE = [
  'Unterlagen und Kontext sichten',
  'Ursachen statt Symptome bestimmen',
  'Die drei größten Umsatzbremsen priorisieren',
  '90-Tage-Plan ableiten',
]

const BEISPIELE = [
  'Unser MedTech-Gerät ist technisch überlegen, aber im Beschaffungsprozess versanden die Gespräche. Kampagnen und Messeauftritte laufen seit einem Jahr.',
  'Wir verkaufen ein Premium-NEM mit belegten Rohstoffen. Der Vertrieb argumentiert über Qualität, die Website über Lifestyle – der Umsatz stagniert seit zwei Quartalen.',
  'Wir sprechen Labore und niedergelassene Ärzte parallel an und wissen nicht, welche Zielgruppe zuerst bedient werden soll.',
]

const STUFEN_DAUER_MS = 620
const MINDESTDAUER_MS = 2500
const LEER = { branche: '', situation: '' }

export function DemoModal({ open, onClose }) {
  const [values, setValues] = useState(LEER)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('form') // form | running | result | error
  const [stage, setStage] = useState(0)
  const [ergebnis, setErgebnis] = useState(null)
  const [fehler, setFehler] = useState('')
  const controllerRef = useRef(null)
  const scrollRef = useRef(null)
  const toast = useToast()

  const abort = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
  }, [])

  // Beim Schließen laufende Anfragen abbrechen; beim Öffnen wieder mit dem
  // Formular starten – die zuletzt eingegebenen Werte bleiben erhalten.
  useEffect(() => {
    if (!open) {
      abort()
      return
    }
    setStatus('form')
    setErgebnis(null)
    setFehler('')
    setStage(0)
  }, [open, abort])

  useEffect(() => () => abort(), [abort])

  // Wechselt der Inhalt (Formular → Lauf → Ergebnis), verschwindet das
  // fokussierte Element. Fokus in den neuen Inhalt setzen, damit Tastatur- und
  // Screenreader-Bedienung dem Ablauf folgt.
  useEffect(() => {
    if (status === 'form') return
    scrollRef.current?.focus({ preventScroll: true })
  }, [status])

  // Fortschrittsanzeige während der Auswertung
  useEffect(() => {
    if (status !== 'running') return undefined
    const timer = setInterval(() => {
      setStage((current) => Math.min(current + 1, SCHRITTE.length - 1))
    }, STUFEN_DAUER_MS)
    return () => clearInterval(timer)
  }, [status])

  const update = (field) => (event) => {
    const { value } = event.target
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }

  const validate = () => {
    const next = {}
    if (!values.branche) next.branche = 'Bitte wählen Sie eine Branche aus.'
    if (values.situation.trim().length < 20) {
      next.situation = 'Bitte beschreiben Sie Ihre Situation in mindestens 20 Zeichen.'
    } else if (values.situation.trim().length > 1500) {
      next.situation = 'Bitte fassen Sie sich etwas kürzer (max. 1500 Zeichen).'
    }
    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(`demo-${Object.keys(nextErrors)[0]}`)?.focus()
      return
    }

    const eingabe = { branche: values.branche, situation: values.situation.trim() }
    const controller = new AbortController()
    controllerRef.current = controller

    setStatus('running')
    setStage(0)
    setFehler('')

    const startzeit = Date.now()

    try {
      const data = await requestAnalysis(eingabe, controller.signal)
      const verbleibend = MINDESTDAUER_MS - (Date.now() - startzeit)
      if (verbleibend > 0) {
        await new Promise((resolve) => setTimeout(resolve, verbleibend))
      }
      if (controller.signal.aborted) return

      setStage(SCHRITTE.length - 1)
      setErgebnis({ ...data, eingabe })
      setStatus('result')
      scrollRef.current?.scrollTo?.({ top: 0 })
    } catch (error) {
      if (controller.signal.aborted) return
      const message =
        error instanceof ApiError
          ? error.message
          : 'Die Auswertung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.'
      setFehler(message)
      setStatus('error')
      toast.show({ title: 'Auswertung fehlgeschlagen', description: message, variant: 'error' })
    } finally {
      controllerRef.current = null
    }
  }

  const neuStarten = () => {
    abort()
    setStatus('form')
    setErgebnis(null)
    setFehler('')
    setStage(0)
  }

  const zumTermin = () => {
    onClose()
    window.setTimeout(() => scrollToSection('termin'), 180)
  }

  const beispielUebernehmen = (text) => {
    setValues((current) => ({ ...current, situation: text }))
    setErrors((current) => ({ ...current, situation: undefined }))
    document.getElementById('demo-situation')?.focus()
  }

  const restzeichen = 1500 - values.situation.length

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Interaktive Demo: SYMMEDIS Ursachenanalyse"
      subtitle="Beta-Demo mit fiktiven Daten – bitte keine echten Patienten- oder Gesundheitsdaten eingeben."
      footer={
        status === 'result' ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="secondary" onClick={neuStarten}>
              <IconRefresh className="size-4" />
              Neue Analyse starten
            </Button>
            <Button onClick={zumTermin}>
              15-Minuten-Diagnosegespräch buchen
              <IconArrowRight className="size-4" />
            </Button>
          </div>
        ) : null
      }
    >
      <div ref={scrollRef} tabIndex={-1} className="outline-none">
        {status === 'form' ? (
          <form onSubmit={handleSubmit} noValidate className="px-5 py-6 sm:px-7 sm:py-7">
            <p className="max-w-2xl text-[0.9375rem] leading-relaxed prose-muted">
              Beschreiben Sie Ihre Situation in wenigen Sätzen. Die Demo führt einen verkürzten
              Analysedurchlauf aus, bewertet die vier Ursachen-Kategorien, benennt die drei größten
              Umsatzbremsen und skizziert einen 90-Tage-Plan.
            </p>

            <div className="mt-7 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
              <Field id="demo-branche" label="Branche" required error={errors.branche}>
                {({ errorId }) => (
                  <select
                    id="demo-branche"
                    name="branche"
                    value={values.branche}
                    onChange={update('branche')}
                    aria-invalid={errors.branche ? 'true' : undefined}
                    aria-describedby={errorId}
                    data-autofocus
                    className={`${controlClasses} ${errors.branche ? controlBorderError : controlBorder}`}
                  >
                    <option value="">Bitte auswählen …</option>
                    {BRANCHEN.map((branche) => (
                      <option key={branche.id} value={branche.id}>
                        {branche.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <Field
                id="demo-situation"
                label="Ihre Situation"
                required
                error={errors.situation}
                hint={`Mindestens 20 Zeichen · noch ${restzeichen} Zeichen verfügbar`}
              >
                {({ hintId, errorId }) => (
                  <textarea
                    id="demo-situation"
                    name="situation"
                    rows={5}
                    maxLength={1500}
                    value={values.situation}
                    onChange={update('situation')}
                    aria-invalid={errors.situation ? 'true' : undefined}
                    aria-describedby={errorId ?? hintId}
                    className={`${controlClasses} resize-y ${errors.situation ? controlBorderError : controlBorder}`}
                    placeholder="Was beobachten Sie? Was haben Sie bereits versucht? Wo hakt es aus Ihrer Sicht?"
                  />
                )}
              </Field>
            </div>

            <div className="mt-6">
              <p className="text-[0.75rem] font-medium tracking-wide text-shell-500 dark:text-night-300">
                Beispiel übernehmen:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {BEISPIELE.map((beispiel, index) => (
                  <button
                    key={beispiel}
                    type="button"
                    onClick={() => beispielUebernehmen(beispiel)}
                    className="rounded-full border border-shell-300 px-3 py-1.5 text-left text-[0.75rem] text-shell-600 transition-colors hover:border-marine-500 hover:text-marine-800 dark:border-night-600 dark:text-night-300 dark:hover:border-marine-400 dark:hover:text-night-100"
                  >
                    Beispiel {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-shell-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-night-700">
              <p className="max-w-md text-[0.75rem] leading-relaxed prose-muted">
                Ihre Eingaben werden ausschließlich für diese Auswertung verarbeitet und nicht
                gespeichert.
              </p>
              <Button type="submit" size="lg">
                <IconSparkles className="size-4" />
                Analyse starten
              </Button>
            </div>
          </form>
        ) : null}

        {status === 'running' ? (
          <div className="px-5 py-12 sm:px-7 sm:py-16">
            <div className="mx-auto max-w-md text-center">
              <span className="inline-flex text-marine-700 dark:text-marine-300">
                <Spinner className="size-7" />
              </span>
              <h3 className="mt-5 text-lg">Analysedurchlauf läuft</h3>
              <p className="mt-2 text-[0.875rem] prose-muted">
                Die Eingaben werden gegen die vier Ursachen-Kategorien geprüft.
              </p>
            </div>

            <ol
              className="mx-auto mt-9 max-w-md space-y-3"
              aria-live="polite"
              aria-label="Fortschritt der Analyse"
            >
              {SCHRITTE.map((schritt, index) => {
                const erledigt = index < stage
                const aktiv = index === stage
                return (
                  <li
                    key={schritt}
                    className={`flex items-center gap-3.5 rounded-sm border px-4 py-3 transition-colors duration-300 ${
                      aktiv
                        ? 'border-marine-300 bg-marine-50 dark:border-marine-600 dark:bg-marine-900/40'
                        : 'border-shell-200 dark:border-night-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[0.6875rem] ${
                        erledigt
                          ? 'bg-marine-800 text-white dark:bg-marine-400 dark:text-night-950'
                          : aktiv
                            ? 'border border-marine-500 text-marine-700 dark:text-marine-300'
                            : 'border border-shell-300 text-shell-400 dark:border-night-600 dark:text-night-300'
                      }`}
                    >
                      {erledigt ? <IconCheck className="size-3.5" strokeWidth={2.4} /> : index + 1}
                    </span>
                    <span
                      className={`text-[0.875rem] ${
                        aktiv || erledigt
                          ? 'text-marine-950 dark:text-night-100'
                          : 'text-shell-500 dark:text-night-300'
                      }`}
                    >
                      {schritt}
                    </span>
                    {aktiv ? (
                      <span className="ml-auto text-[0.6875rem] tracking-wide text-marine-600 animate-pulse-soft dark:text-marine-300">
                        läuft
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ol>

            <div className="mt-8 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  abort()
                  setStatus('form')
                }}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        ) : null}

        {status === 'result' && ergebnis ? (
          <AnalysisResult
            analysis={ergebnis.analysis}
            source={ergebnis.source}
            notice={ergebnis.notice}
            eingabe={ergebnis.eingabe}
          />
        ) : null}

        {status === 'error' ? (
          <div className="px-5 py-14 text-center sm:px-7">
            <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full border border-[#b4462f]/35 text-[#b4462f] dark:border-[#e08a72]/40 dark:text-[#e08a72]">
              <IconAlert className="size-6" />
            </span>
            <h3 className="mt-5 text-lg">Auswertung nicht möglich</h3>
            <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed prose-muted">
              {fehler}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
              <Button variant="secondary" onClick={neuStarten}>
                <IconRefresh className="size-4" />
                Eingaben anpassen
              </Button>
              <Button onClick={zumTermin}>Stattdessen Gespräch buchen</Button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
