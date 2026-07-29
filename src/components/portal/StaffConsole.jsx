import { useEffect, useMemo, useRef, useState } from 'react'
import { LIVE_CONVERSATION_ID } from '../../context/InboxContext.js'
import { useInbox } from '../../hooks/useInbox.js'
import { useToast } from '../../hooks/useToast.js'
import { Button } from '../ui/Button.jsx'
import { IconArrowRight, IconSend, IconTeam } from '../ui/Icons.jsx'
import { Spinner } from '../ui/Spinner.jsx'

const FILTER = [
  { id: 'alle', label: 'Alle' },
  { id: 'offen', label: 'Offen' },
  { id: 'beantwortet', label: 'Beantwortet' },
]

const STATUS_LABEL = {
  offen: 'Offen',
  'in-bearbeitung': 'In Bearbeitung',
  beantwortet: 'Beantwortet',
}

const STATUS_STYLE = {
  offen: 'border-[#b4462f]/30 text-[#b4462f] bg-[#b4462f]/6 dark:text-[#e08a72] dark:border-[#e08a72]/35 dark:bg-[#e08a72]/10',
  'in-bearbeitung':
    'border-brass-400/45 text-brass-700 bg-brass-50 dark:text-brass-300 dark:border-brass-400/35 dark:bg-brass-400/10',
  beantwortet:
    'border-marine-300 text-marine-700 bg-marine-50 dark:text-marine-300 dark:border-marine-600 dark:bg-marine-900/40',
}

const KANAL_LABEL = {
  live: 'Live-Chat',
  kundenportal: 'Kundenportal',
  formular: 'Formular',
}

const TEXTBAUSTEINE = [
  {
    id: 'termin',
    label: 'Terminvorschlag',
    text: 'Vielen Dank für Ihre Nachricht. Ich schlage ein 15-minütiges Diagnosegespräch vor – darin klären wir, ob eine Ursachenanalyse für Sie sinnvoll ist. Passt Ihnen einer der kommenden Vormittage?',
  },
  {
    id: 'unterlagen',
    label: 'Unterlagen anfordern',
    text: 'Für eine erste Einordnung wären hilfreich: Vertriebsunterlagen, aktuelle Außenkommunikation und vorhandene Belege oder Studien. Diese sichten wir im ersten Analyseschritt strukturiert und vollständig.',
  },
  {
    id: 'einordnung',
    label: 'Fachliche Einordnung',
    text: 'Ihre Schilderung deutet darauf hin, dass Marketing hier eher Symptom als Ursache ist. Genau diese Unterscheidung nehmen wir im zweiten Analyseschritt vor – belegt, nicht vermutet.',
  },
]

export function StaffConsole({ session }) {
  const { conversations, addStaffReply, setStatus, markRead } = useInbox()
  const [filter, setFilter] = useState('alle')
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? null)
  const [entwurf, setEntwurf] = useState('')
  const [sending, setSending] = useState(false)
  const [mobileView, setMobileView] = useState('liste') // liste | thread
  const threadRef = useRef(null)
  const toast = useToast()

  const gefiltert = useMemo(() => {
    if (filter === 'offen') return conversations.filter((c) => c.status !== 'beantwortet')
    if (filter === 'beantwortet') return conversations.filter((c) => c.status === 'beantwortet')
    return conversations
  }, [conversations, filter])

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  )

  // Auswahl gültig halten, wenn der Filter die aktuelle Anfrage ausblendet.
  useEffect(() => {
    if (gefiltert.length === 0) return
    if (!gefiltert.some((c) => c.id === selectedId)) {
      setSelectedId(gefiltert[0].id)
    }
  }, [gefiltert, selectedId])

  useEffect(() => {
    if (selectedId) markRead(selectedId)
  }, [selectedId, markRead])

  useEffect(() => {
    const node = threadRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [selected?.messages, sending])

  const auswaehlen = (id) => {
    setSelectedId(id)
    setEntwurf('')
    setMobileView('thread')
  }

  const antworten = async (event) => {
    event.preventDefault()
    const text = entwurf.trim()
    if (!text || !selected || sending) return

    setSending(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    addStaffReply(selected.id, text)
    setEntwurf('')
    setSending(false)

    toast.show({
      title: 'Antwort gesendet (Demo)',
      description:
        selected.id === LIVE_CONVERSATION_ID
          ? 'Die Antwort erscheint sofort im Kundenchat.'
          : `Anfrage von ${selected.unternehmen} wurde als beantwortet markiert.`,
      variant: 'success',
    })
  }

  const offene = conversations.filter((c) => c.status !== 'beantwortet').length

  return (
    <div className="flex h-[min(70vh,34rem)] flex-col">
      {/* Kopfzeile */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-shell-200 px-5 py-3 sm:px-7 dark:border-night-700">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brass-500 text-white dark:bg-brass-400 dark:text-night-950">
            <IconTeam className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.875rem] leading-tight font-medium text-marine-950 dark:text-night-100">
              Interner Posteingang
            </p>
            <p className="truncate text-[0.6875rem] prose-muted">
              {session.email} · {offene} offen von {conversations.length}
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Anfragen filtern"
          className="flex rounded-sm border border-shell-200 p-0.5 dark:border-night-700"
        >
          {FILTER.map((eintrag) => (
            <button
              key={eintrag.id}
              type="button"
              role="tab"
              aria-selected={filter === eintrag.id}
              onClick={() => setFilter(eintrag.id)}
              className={`rounded-xs px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${
                filter === eintrag.id
                  ? 'bg-marine-800 text-white dark:bg-marine-400 dark:text-night-950'
                  : 'text-shell-600 hover:text-marine-900 dark:text-night-300 dark:hover:text-night-100'
              }`}
            >
              {eintrag.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Liste */}
        <div
          className={`no-scrollbar min-h-0 overflow-y-auto border-shell-200 md:border-r dark:border-night-700 ${
            mobileView === 'thread' ? 'hidden md:block' : 'block'
          }`}
        >
          {gefiltert.length === 0 ? (
            <p className="px-5 py-8 text-center text-[0.8125rem] prose-muted">
              Keine Anfragen in diesem Filter.
            </p>
          ) : (
            <ul>
              {gefiltert.map((conversation) => {
                const aktiv = conversation.id === selectedId
                const letzte = conversation.messages[conversation.messages.length - 1]
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => auswaehlen(conversation.id)}
                      aria-current={aktiv ? 'true' : undefined}
                      className={`w-full border-b border-shell-200 px-4 py-3.5 text-left transition-colors dark:border-night-800 ${
                        aktiv
                          ? 'bg-marine-50 dark:bg-marine-900/35'
                          : 'hover:bg-shell-50 dark:hover:bg-night-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[0.8125rem] font-medium text-marine-950 dark:text-night-100">
                          {conversation.unternehmen}
                        </p>
                        {conversation.ungelesen ? (
                          <span
                            aria-label="ungelesen"
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-brass-500 dark:bg-brass-400"
                          />
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-[0.75rem] prose-muted">
                        {conversation.thema}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-[0.6875rem] leading-snug prose-muted">
                        {letzte?.text}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className={`rounded-full border px-1.5 py-0.5 text-[0.625rem] ${STATUS_STYLE[conversation.status]}`}
                        >
                          {STATUS_LABEL[conversation.status]}
                        </span>
                        <span className="rounded-full border border-shell-200 px-1.5 py-0.5 text-[0.625rem] text-shell-500 dark:border-night-700 dark:text-night-300">
                          {KANAL_LABEL[conversation.kanal]}
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Thread */}
        <div
          className={`flex min-h-0 flex-col ${mobileView === 'liste' ? 'hidden md:flex' : 'flex'}`}
        >
          {selected ? (
            <>
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-shell-200 px-4 py-3 sm:px-5 dark:border-night-700">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileView('liste')}
                    className="mb-1 inline-flex items-center gap-1 rounded-sm text-[0.75rem] text-marine-700 md:hidden dark:text-marine-300"
                  >
                    <IconArrowRight className="size-3.5 rotate-180" />
                    Zurück zur Liste
                  </button>
                  <p className="truncate text-[0.875rem] font-medium text-marine-950 dark:text-night-100">
                    {selected.unternehmen}
                  </p>
                  <p className="truncate text-[0.6875rem] prose-muted">{selected.person}</p>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="status-select" className="sr-only">
                    Status ändern
                  </label>
                  <select
                    id="status-select"
                    value={selected.status}
                    onChange={(event) => setStatus(selected.id, event.target.value)}
                    className="rounded-sm border border-shell-300 bg-white px-2 py-1.5 text-[0.75rem] text-marine-900 dark:border-night-600 dark:bg-night-900 dark:text-night-100"
                  >
                    <option value="offen">Offen</option>
                    <option value="in-bearbeitung">In Bearbeitung</option>
                    <option value="beantwortet">Beantwortet</option>
                  </select>
                </div>
              </div>

              <div
                ref={threadRef}
                className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto bg-shell-50 px-4 py-4 sm:px-5 dark:bg-night-950/40"
                role="log"
                aria-label={`Verlauf ${selected.unternehmen}`}
              >
                {selected.messages.map((message) => {
                  const intern = message.from === 'symmedis'
                  return (
                    <div key={message.id} className={`flex ${intern ? 'justify-end' : ''}`}>
                      <div className="max-w-[88%]">
                        <p className="mb-1 text-[0.6875rem] prose-muted">
                          {message.author} · {message.time}
                          {message.via === 'ki' || message.via === 'demo' ? ' · automatisch' : ''}
                        </p>
                        <div
                          className={`rounded-sm border px-3.5 py-2.5 text-[0.8125rem] leading-relaxed whitespace-pre-wrap ${
                            intern
                              ? 'border-marine-800 bg-marine-800 text-white dark:border-marine-600 dark:bg-marine-800'
                              : 'border-shell-200 bg-white text-marine-950 dark:border-night-700 dark:bg-night-900 dark:text-night-100'
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <form
                onSubmit={antworten}
                className="shrink-0 border-t border-shell-200 px-4 py-3.5 sm:px-5 dark:border-night-700"
              >
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {TEXTBAUSTEINE.map((baustein) => (
                    <button
                      key={baustein.id}
                      type="button"
                      onClick={() => setEntwurf(baustein.text)}
                      className="rounded-full border border-shell-300 px-2.5 py-1 text-[0.6875rem] text-shell-600 transition-colors hover:border-marine-500 hover:text-marine-800 dark:border-night-600 dark:text-night-300 dark:hover:border-marine-400 dark:hover:text-night-100"
                    >
                      {baustein.label}
                    </button>
                  ))}
                </div>

                <label htmlFor="staff-antwort" className="sr-only">
                  Antwort an {selected.unternehmen}
                </label>
                <div className="flex items-end gap-2">
                  <textarea
                    id="staff-antwort"
                    rows={2}
                    value={entwurf}
                    maxLength={2000}
                    onChange={(event) => setEntwurf(event.target.value)}
                    placeholder="Antwort verfassen …"
                    className="w-full resize-none rounded-sm border border-shell-300 bg-white px-3.5 py-2.5 text-[0.8125rem] text-marine-950 placeholder:text-shell-400 transition-colors hover:border-shell-400 focus:border-marine-600 dark:border-night-600 dark:bg-night-900 dark:text-night-100 dark:placeholder:text-night-300/70 dark:focus:border-marine-400"
                  />
                  <Button
                    type="submit"
                    className="h-11"
                    disabled={sending || entwurf.trim().length === 0}
                  >
                    {sending ? <Spinner className="size-4" /> : <IconSend className="size-4" />}
                    <span className="sr-only sm:not-sr-only">Senden</span>
                  </Button>
                </div>
                <p className="mt-2 text-[0.6875rem] prose-muted">
                  Demo-Zustand: Antworten werden nicht versendet.
                  {selected.id === LIVE_CONVERSATION_ID
                    ? ' Diese Antwort erscheint direkt im Kundenchat.'
                    : ''}
                </p>
              </form>
            </>
          ) : (
            <p className="p-8 text-center text-[0.8125rem] prose-muted">
              Bitte wählen Sie links eine Anfrage aus.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
