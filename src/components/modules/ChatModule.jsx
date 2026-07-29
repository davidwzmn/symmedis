import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/cn.js'
import { formatTime, formatDate } from '../../lib/format.js'
import { requestChatReply } from '../../lib/api.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useToast } from '../../hooks/useToast.js'
import { Avatar, Button, Chip, Spinner, TypingDots } from '../ui/primitives.jsx'
import { Card, Banner } from '../ui/layout.jsx'
import { IconAlert, IconSend, IconShield, IconSparkles, IconUsers } from '../ui/Icons.jsx'

/**
 * Nachrichtenmodul – ein Bereich der Plattform, nie die Hauptansicht.
 *
 * rolle = 'kunde' / 'demo' → Nachricht an SYMMEDIS; der KI-Assistent antwortet
 *   sofort und ist als vorläufige Auskunft gekennzeichnet.
 * rolle = 'intern' → Antwort im Namen des Teams. Ein KI-Vorschlag kann erzeugt
 *   werden, wird aber nur in das Eingabefeld übernommen und nie automatisch
 *   gesendet.
 */
export function ChatModule({ kunde, rolle = 'kunde', kompakt = false }) {
  const { addNachricht } = useWorkspace()
  const toast = useToast()
  const [entwurf, setEntwurf] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const [vorschlagLaeuft, setVorschlagLaeuft] = useState(false)
  const [fehler, setFehler] = useState(null)
  const [hinweis, setHinweis] = useState(null)
  const endeRef = useRef(null)
  const abbruchRef = useRef(null)

  const intern = rolle === 'intern'

  useEffect(() => () => abbruchRef.current?.abort(), [])

  useEffect(() => {
    endeRef.current?.scrollIntoView({ block: 'end' })
  }, [kunde.chat.length, laeuft])

  /** Vollständige Conversation-History für die Schnittstelle. */
  const verlauf = useMemo(
    () =>
      kunde.chat.map((nachricht) => ({
        role: nachricht.from === 'kunde' ? 'user' : 'assistant',
        content: nachricht.text,
      })),
    [kunde.chat],
  )

  const senden = useCallback(async () => {
    const text = entwurf.trim()
    if (!text || laeuft) return

    setEntwurf('')
    setFehler(null)

    if (intern) {
      addNachricht(kunde.id, { from: 'symmedis', via: 'team', author: 'M. Reinhardt', text })
      toast.show({
        title: 'Nachricht gesendet',
        description: 'Sie erscheint sofort im Kundenportal.',
        variant: 'success',
      })
      return
    }

    addNachricht(kunde.id, { from: 'kunde', author: kunde.ansprechpartner.name, text })

    // Volle History inklusive der neuen Nachricht an die Schnittstelle
    const controller = new AbortController()
    abbruchRef.current = controller
    setLaeuft(true)

    try {
      const antwort = await requestChatReply([...verlauf, { role: 'user', content: text }], controller.signal)
      addNachricht(kunde.id, {
        from: 'symmedis',
        via: 'ki',
        author: 'SYMMEDIS Assistent',
        text: antwort.reply,
      })
      setHinweis(antwort.notice ?? null)
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setFehler(
          'Die Antwort konnte nicht geladen werden. Ihre Nachricht ist gespeichert – bitte versuchen Sie es erneut.',
        )
      }
    } finally {
      setLaeuft(false)
      abbruchRef.current = null
    }
  }, [entwurf, laeuft, intern, addNachricht, kunde.id, kunde.ansprechpartner.name, verlauf, toast])

  /** Antwortvorschlag erzeugen – landet ausschließlich im Eingabefeld. */
  const vorschlagen = useCallback(async () => {
    if (vorschlagLaeuft) return
    const controller = new AbortController()
    abbruchRef.current = controller
    setVorschlagLaeuft(true)
    setFehler(null)

    try {
      const antwort = await requestChatReply(verlauf, controller.signal)
      setEntwurf(antwort.reply)
      setHinweis(antwort.notice ?? null)
      toast.show({
        title: 'Vorschlag übernommen',
        description: 'Prüfen und anpassen – gesendet wird erst auf Ihre Freigabe.',
      })
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setFehler('Der Vorschlag konnte nicht erzeugt werden. Bitte erneut versuchen.')
      }
    } finally {
      setVorschlagLaeuft(false)
      abbruchRef.current = null
    }
  }, [verlauf, vorschlagLaeuft, toast])

  return (
    <div className={cn('min-w-0 space-y-4', !kompakt && 'space-y-5')}>
      {!kompakt ? (
        intern ? (
          <Banner toneName="warn" icon={IconShield} title="Freigabe erforderlich">
            KI-Antwortvorschläge werden nur in das Eingabefeld übernommen. Es wird nichts
            automatisch an den Kunden gesendet.
          </Banner>
        ) : (
          <Banner toneName="info" icon={IconSparkles} title="Vorläufige Auskunft">
            Der Assistent ordnet Ihre Frage sofort ein. Verbindlich ist erst die Antwort des
            SYMMEDIS-Teams – sie erscheint im selben Verlauf.
          </Banner>
        )
      ) : null}

      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
          <Avatar name={intern ? kunde.ansprechpartner.name : 'SYMMEDIS Team'} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8125rem] font-semibold text-ink">
              {intern ? kunde.ansprechpartner.name : 'SYMMEDIS Team'}
            </p>
            <p className="truncate text-xs text-ink-3">
              {intern ? `${kunde.unternehmen} · ${kunde.ansprechpartner.rolle}` : 'Antwort werktags innerhalb von 24 Stunden'}
            </p>
          </div>
          <Chip size="sm" toneName="neutral" icon={IconUsers}>
            {kunde.chat.length} Nachrichten
          </Chip>
        </div>

        <div
          className={cn(
            'scroll-area flex-1 space-y-4 overflow-y-auto bg-canvas px-4 py-4 sm:px-5',
            kompakt ? 'h-[22rem]' : 'h-[26rem] lg:h-[32rem]',
          )}
        >
          {kunde.chat.map((nachricht, index) => {
            const vorher = kunde.chat[index - 1]
            const neuerTag =
              !vorher || formatDate(vorher.zeit) !== formatDate(nachricht.zeit)
            const eigen = intern ? nachricht.from === 'symmedis' : nachricht.from === 'kunde'

            return (
              <div key={nachricht.id}>
                {neuerTag ? (
                  <p className="mb-4 text-center text-xs text-ink-3">{formatDate(nachricht.zeit)}</p>
                ) : null}
                <div className={cn('flex gap-2.5', eigen && 'flex-row-reverse')}>
                  <Avatar name={nachricht.author} size="sm" className="mt-0.5" />
                  <div className={cn('min-w-0 max-w-[85%] sm:max-w-[75%]', eigen && 'text-right')}>
                    <p className="mb-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
                      <span className="font-medium text-ink-2">{nachricht.author}</span>
                      {nachricht.via === 'ki' ? (
                        <Chip size="sm" toneName="brand" icon={IconSparkles}>
                          KI-Assistent
                        </Chip>
                      ) : null}
                      <span>{formatTime(nachricht.zeit)}</span>
                    </p>
                    <div
                      className={cn(
                        'inline-block rounded-xl border px-3.5 py-2.5 text-left text-[0.875rem] leading-relaxed',
                        eigen
                          ? 'border-brand-border bg-brand-soft text-ink'
                          : 'border-line bg-surface text-ink',
                      )}
                    >
                      {nachricht.text.split('\n').map((zeile, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : undefined}>
                          {zeile}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {laeuft ? (
            <div className="flex gap-2.5">
              <Avatar name="SYMMEDIS Assistent" size="sm" className="mt-0.5" />
              <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink-3">
                <TypingDots />
                <span className="text-xs">Antwort wird erstellt</span>
              </div>
            </div>
          ) : null}

          <div ref={endeRef} />
        </div>

        {fehler ? (
          <div className="flex items-start gap-2 border-t border-danger-border bg-danger-soft px-4 py-2.5 text-[0.8125rem] text-danger-ink sm:px-5">
            <IconAlert className="mt-0.5 size-4 shrink-0" />
            {fehler}
          </div>
        ) : null}

        {hinweis ? (
          <p className="border-t border-line bg-surface-muted px-4 py-2 text-xs text-ink-3 sm:px-5">
            {hinweis}
          </p>
        ) : null}

        <form
          className="border-t border-line px-4 py-3 sm:px-5"
          onSubmit={(event) => {
            event.preventDefault()
            senden()
          }}
        >
          <label htmlFor="chat-eingabe" className="sr-only">
            Nachricht schreiben
          </label>
          <textarea
            id="chat-eingabe"
            rows={2}
            value={entwurf}
            onChange={(e) => setEntwurf(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                senden()
              }
            }}
            placeholder={
              intern
                ? 'Antwort an den Kunden …'
                : 'Ihre Frage an SYMMEDIS – bitte keine Patienten- oder Gesundheitsdaten.'
            }
            className="w-full resize-y rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-3/80 focus:border-brand focus:outline-none"
          />
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-ink-3">
              {intern
                ? 'Sichtbar für den Kunden, sobald gesendet.'
                : 'Verlauf besteht nur in dieser Sitzung.'}
            </p>
            <div className="flex items-center gap-2">
              {intern ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={vorschlagen}
                  disabled={vorschlagLaeuft}
                >
                  {vorschlagLaeuft ? <Spinner /> : <IconSparkles className="size-4" />}
                  Antwortvorschlag
                </Button>
              ) : null}
              <Button type="submit" size="sm" disabled={!entwurf.trim() || laeuft}>
                {laeuft ? <Spinner /> : <IconSend className="size-4" />}
                Senden
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}
