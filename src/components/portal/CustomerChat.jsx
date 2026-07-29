import { useEffect, useMemo, useRef, useState } from 'react'
import { ApiError, requestChatReply } from '../../lib/api.js'
import { useInbox } from '../../hooks/useInbox.js'
import { useToast } from '../../hooks/useToast.js'
import { Button } from '../ui/Button.jsx'
import { IconRefresh, IconSend, IconSparkles, IconTeam } from '../ui/Icons.jsx'
import { TypingDots } from '../ui/Spinner.jsx'

const VORSCHLAEGE = [
  'Wie läuft die Ursachenanalyse ab?',
  'Woran erkenne ich, ob Marketing die Ursache ist?',
  'Was bekomme ich am Ende konkret geliefert?',
]

/** Verlauf für die API: beginnt immer mit einer Nutzernachricht. */
function toApiHistory(messages) {
  const mapped = messages.map((message) => ({
    role: message.from === 'kunde' ? 'user' : 'assistant',
    content: message.text,
  }))
  const start = mapped.findIndex((message) => message.role === 'user')
  return start === -1 ? [] : mapped.slice(start)
}

export function CustomerChat({ session }) {
  const { liveConversation, addCustomerMessage, addAssistantMessage, resetLiveChat } = useInbox()
  const [entwurf, setEntwurf] = useState('')
  const [sending, setSending] = useState(false)
  const [quelle, setQuelle] = useState(null)
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const toast = useToast()

  const messages = useMemo(() => liveConversation?.messages ?? [], [liveConversation])

  useEffect(() => {
    const node = listRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, sending])

  const senden = async (text) => {
    const inhalt = text.trim()
    if (!inhalt || sending) return

    const history = [...toApiHistory(messages), { role: 'user', content: inhalt }]

    addCustomerMessage(inhalt)
    setEntwurf('')
    setSending(true)

    try {
      const data = await requestChatReply(history)
      addAssistantMessage(data.reply, { source: data.source })
      setQuelle(data.source)
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Die Antwort konnte nicht geladen werden. Bitte versuchen Sie es erneut.'
      toast.show({ title: 'Nachricht nicht zugestellt', description: message, variant: 'error' })
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      senden(entwurf)
    }
  }

  return (
    <div className="flex h-[min(70vh,34rem)] flex-col">
      {/* Kopfzeile */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-shell-200 px-5 py-3 sm:px-7 dark:border-night-700">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-marine-800 text-white dark:bg-marine-400 dark:text-night-950">
            <IconSparkles className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.875rem] leading-tight font-medium text-marine-950 dark:text-night-100">
              SYMMEDIS Beratung
            </p>
            <p className="truncate text-[0.6875rem] prose-muted">
              Angemeldet als {session.email} · Demo-Zugang
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quelle ? (
            <span className="rounded-full border border-shell-200 px-2.5 py-1 text-[0.625rem] tracking-wide text-shell-500 dark:border-night-700 dark:text-night-300">
              {quelle === 'ki' ? 'KI-gestützt' : 'Demo-Modell'}
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetLiveChat()
              setQuelle(null)
              setEntwurf('')
              inputRef.current?.focus()
            }}
          >
            <IconRefresh className="size-3.5" />
            Neu starten
          </Button>
        </div>
      </div>

      {/* Verlauf */}
      <div
        ref={listRef}
        className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-shell-50 px-5 py-5 sm:px-7 dark:bg-night-950/40"
        role="log"
        aria-live="polite"
        aria-label="Chatverlauf"
      >
        {messages.map((message) => {
          const vomKunden = message.from === 'kunde'
          const vomTeam = message.via === 'team'
          return (
            <div
              key={message.id}
              className={`flex ${vomKunden ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[78%] ${vomKunden ? 'text-right' : ''}`}>
                <p className="mb-1 flex items-center gap-1.5 text-[0.6875rem] prose-muted">
                  {!vomKunden && vomTeam ? (
                    <IconTeam className="size-3.5 text-brass-500 dark:text-brass-400" />
                  ) : null}
                  <span>{vomKunden ? 'Sie' : vomTeam ? 'SYMMEDIS Team' : message.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{message.time}</span>
                </p>
                <div
                  className={`rounded-sm border px-4 py-3 text-left text-[0.875rem] leading-relaxed whitespace-pre-wrap ${
                    vomKunden
                      ? 'border-marine-800 bg-marine-800 text-white dark:border-marine-600 dark:bg-marine-800'
                      : vomTeam
                        ? 'border-brass-300/70 bg-brass-50 text-marine-950 dark:border-brass-400/40 dark:bg-brass-400/10 dark:text-night-100'
                        : 'border-shell-200 bg-white text-marine-950 dark:border-night-700 dark:bg-night-900 dark:text-night-100'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          )
        })}

        {sending ? (
          <div className="flex justify-start">
            <div className="rounded-sm border border-shell-200 bg-white px-4 py-3 text-shell-500 dark:border-night-700 dark:bg-night-900 dark:text-night-300">
              <TypingDots />
            </div>
          </div>
        ) : null}
      </div>

      {/* Eingabe */}
      <div className="shrink-0 border-t border-shell-200 px-5 py-4 sm:px-7 dark:border-night-700">
        {messages.filter((m) => m.from === 'kunde').length === 0 && !sending ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {VORSCHLAEGE.map((vorschlag) => (
              <button
                key={vorschlag}
                type="button"
                onClick={() => senden(vorschlag)}
                className="rounded-full border border-shell-300 px-3 py-1.5 text-[0.75rem] text-shell-600 transition-colors hover:border-marine-500 hover:text-marine-800 dark:border-night-600 dark:text-night-300 dark:hover:border-marine-400 dark:hover:text-night-100"
              >
                {vorschlag}
              </button>
            ))}
          </div>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault()
            senden(entwurf)
          }}
          className="flex items-end gap-2"
        >
          <label htmlFor="chat-eingabe" className="sr-only">
            Ihre Nachricht
          </label>
          <textarea
            id="chat-eingabe"
            ref={inputRef}
            rows={2}
            value={entwurf}
            maxLength={2000}
            onChange={(event) => setEntwurf(event.target.value)}
            onKeyDown={onKeyDown}
            data-autofocus
            placeholder="Ihre Nachricht … (Enter senden, Umschalt+Enter für neue Zeile)"
            className="w-full resize-none rounded-sm border border-shell-300 bg-white px-3.5 py-2.5 text-[0.875rem] text-marine-950 placeholder:text-shell-400 transition-colors hover:border-shell-400 focus:border-marine-600 dark:border-night-600 dark:bg-night-900 dark:text-night-100 dark:placeholder:text-night-300/70 dark:focus:border-marine-400"
          />
          <Button type="submit" disabled={sending || entwurf.trim().length === 0} className="h-11">
            <IconSend className="size-4" />
            <span className="sr-only sm:not-sr-only">Senden</span>
          </Button>
        </form>

        <p className="mt-2 text-[0.6875rem] prose-muted">
          Beta-Demo · Verlauf nur im Arbeitsspeicher · keine echten Patienten- oder
          Gesundheitsdaten eingeben.
        </p>
      </div>
    </div>
  )
}
