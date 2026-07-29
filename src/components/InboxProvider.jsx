import { useCallback, useMemo, useState } from 'react'
import { InboxContext, LIVE_CONVERSATION_ID } from '../context/InboxContext.js'

let messageCounter = 0
function nextId(prefix) {
  messageCounter += 1
  return `${prefix}-${messageCounter}`
}

function clockLabel() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const BEGRUESSUNG =
  'Guten Tag, schön dass Sie da sind. Ich bin Ihr Ansprechpartner bei SYMMEDIS und helfe Ihnen dabei einzuordnen, ob eine Ursachenanalyse für Ihr Unternehmen sinnvoll ist. Womit kann ich Ihnen weiterhelfen?'

/** Fiktive Demo-Anfragen für die interne Mitarbeiteransicht. */
function seedConversations() {
  return [
    {
      id: LIVE_CONVERSATION_ID,
      unternehmen: 'Ihr Kundenchat (live)',
      person: 'Aktive Sitzung',
      thema: 'Live-Beratung über den Kundenlogin',
      kanal: 'live',
      status: 'offen',
      ungelesen: false,
      messages: [
        {
          id: nextId('msg'),
          from: 'symmedis',
          via: 'ki',
          author: 'SYMMEDIS Assistent',
          text: BEGRUESSUNG,
          time: clockLabel(),
        },
      ],
    },
    {
      id: 'anfrage-nordvita',
      unternehmen: 'Nordvita Vitalstoffe GmbH',
      person: 'Dr. Katrin Ahlers, Geschäftsführung',
      thema: 'Umsatz stagniert trotz laufender Kampagnen',
      kanal: 'kundenportal',
      status: 'offen',
      ungelesen: true,
      messages: [
        {
          id: nextId('msg'),
          from: 'kunde',
          author: 'Dr. Katrin Ahlers',
          text: 'Wir haben unser Premium-Sortiment im Frühjahr neu aufgestellt, Website und Kampagnen laufen seit vier Monaten. Die Reichweite ist da, der Umsatz bewegt sich aber kaum. Ist das ein Fall für Ihre Ursachenanalyse?',
          time: '08:41',
        },
        {
          id: nextId('msg'),
          from: 'kunde',
          author: 'Dr. Katrin Ahlers',
          text: 'Ergänzend: Unser Vertrieb argumentiert stark über Rohstoffqualität, die Website eher über Lifestyle. Vielleicht liegt es daran?',
          time: '08:44',
        },
      ],
    },
    {
      id: 'anfrage-medisens',
      unternehmen: 'MediSens Diagnostics AG',
      person: 'Tobias Herzog, Leitung Marketing',
      thema: 'Zwei Zielgruppen, unklare Priorität',
      kanal: 'kundenportal',
      status: 'in-bearbeitung',
      ungelesen: true,
      messages: [
        {
          id: nextId('msg'),
          from: 'kunde',
          author: 'Tobias Herzog',
          text: 'Wir sprechen Labore und niedergelassene Ärzte gleichzeitig an und wissen intern nicht, welche Gruppe zuerst bedient werden soll. Können Sie so etwas im Rahmen der Analyse klären?',
          time: '09:15',
        },
        {
          id: nextId('msg'),
          from: 'symmedis',
          via: 'team',
          author: 'M. Reinhardt, SYMMEDIS',
          text: 'Guten Tag Herr Herzog, ja – die Priorisierung von Zielgruppen ist Teil des Analyseschritts „Ursachen statt Symptome bestimmen“. Ich melde mich heute mit einem Terminvorschlag für das Diagnosegespräch.',
          time: '09:52',
        },
        {
          id: nextId('msg'),
          from: 'kunde',
          author: 'Tobias Herzog',
          text: 'Sehr gern. Welche Unterlagen sollten wir vorbereiten?',
          time: '10:07',
        },
      ],
    },
    {
      id: 'anfrage-kardiolink',
      unternehmen: 'KardioLink Systems',
      person: 'Sabine Wolter, Vertriebsleitung',
      thema: 'Belege vorhanden, wirken aber nicht',
      kanal: 'kundenportal',
      status: 'beantwortet',
      ungelesen: false,
      messages: [
        {
          id: nextId('msg'),
          from: 'kunde',
          author: 'Sabine Wolter',
          text: 'Wir haben zwei klinische Anwendungsstudien, die im Verkaufsgespräch aber kaum eine Rolle spielen. Woran liegt so etwas erfahrungsgemäß?',
          time: 'Gestern, 16:22',
        },
        {
          id: nextId('msg'),
          from: 'symmedis',
          via: 'team',
          author: 'M. Reinhardt, SYMMEDIS',
          text: 'Meist daran, dass Belege nicht in Kundenvorteil übersetzt sind. Wir prüfen genau das im Schritt „Differenzierung“ und liefern die Übersetzung als Teil des 90-Tage-Plans mit.',
          time: 'Gestern, 17:05',
        },
      ],
    },
  ]
}

export function InboxProvider({ children }) {
  const [conversations, setConversations] = useState(seedConversations)

  const updateConversation = useCallback((id, updater) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? updater(conversation) : conversation,
      ),
    )
  }, [])

  /** Nachricht der Kundin/des Kunden aus dem Live-Chat. */
  const addCustomerMessage = useCallback(
    (text) => {
      updateConversation(LIVE_CONVERSATION_ID, (conversation) => ({
        ...conversation,
        status: 'offen',
        ungelesen: true,
        messages: [
          ...conversation.messages,
          {
            id: nextId('msg'),
            from: 'kunde',
            author: 'Kunde (Demo-Sitzung)',
            text,
            time: clockLabel(),
          },
        ],
      }))
    },
    [updateConversation],
  )

  /** Antwort des KI-gestützten Assistenten im Live-Chat. */
  const addAssistantMessage = useCallback(
    (text, { source = 'ki' } = {}) => {
      updateConversation(LIVE_CONVERSATION_ID, (conversation) => ({
        ...conversation,
        messages: [
          ...conversation.messages,
          {
            id: nextId('msg'),
            from: 'symmedis',
            via: source === 'demo' ? 'demo' : 'ki',
            author: 'SYMMEDIS Assistent',
            text,
            time: clockLabel(),
          },
        ],
      }))
    },
    [updateConversation],
  )

  /** Antwort einer Mitarbeiterin/eines Mitarbeiters aus der internen Ansicht. */
  const addStaffReply = useCallback(
    (conversationId, text) => {
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        status: 'beantwortet',
        ungelesen: false,
        messages: [
          ...conversation.messages,
          {
            id: nextId('msg'),
            from: 'symmedis',
            via: 'team',
            author: 'M. Reinhardt, SYMMEDIS',
            text,
            time: clockLabel(),
          },
        ],
      }))
    },
    [updateConversation],
  )

  const setStatus = useCallback(
    (conversationId, status) => {
      updateConversation(conversationId, (conversation) => ({ ...conversation, status }))
    },
    [updateConversation],
  )

  const markRead = useCallback(
    (conversationId) => {
      updateConversation(conversationId, (conversation) =>
        conversation.ungelesen ? { ...conversation, ungelesen: false } : conversation,
      )
    },
    [updateConversation],
  )

  /** Neue Anfrage aus dem Kontaktformular – landet direkt im internen Posteingang. */
  const addFormRequest = useCallback(({ name, email, firma, nachricht }) => {
    const id = nextId('anfrage')
    setConversations((current) => [
      current[0],
      {
        id,
        unternehmen: firma?.trim() || 'Ohne Firmenangabe',
        person: `${name} · ${email}`,
        thema: 'Anfrage 15-Minuten-Diagnosegespräch',
        kanal: 'formular',
        status: 'offen',
        ungelesen: true,
        messages: [
          {
            id: nextId('msg'),
            from: 'kunde',
            author: name,
            text: nachricht?.trim() || 'Keine Nachricht hinterlassen.',
            time: clockLabel(),
          },
        ],
      },
      ...current.slice(1),
    ])
    return id
  }, [])

  const resetLiveChat = useCallback(() => {
    updateConversation(LIVE_CONVERSATION_ID, (conversation) => ({
      ...conversation,
      status: 'offen',
      ungelesen: false,
      messages: [
        {
          id: nextId('msg'),
          from: 'symmedis',
          via: 'ki',
          author: 'SYMMEDIS Assistent',
          text: BEGRUESSUNG,
          time: clockLabel(),
        },
      ],
    }))
  }, [updateConversation])

  const liveConversation = useMemo(
    () => conversations.find((c) => c.id === LIVE_CONVERSATION_ID) ?? null,
    [conversations],
  )

  const offeneAnzahl = useMemo(
    () => conversations.filter((c) => c.status !== 'beantwortet').length,
    [conversations],
  )

  const value = useMemo(
    () => ({
      conversations,
      liveConversation,
      offeneAnzahl,
      addCustomerMessage,
      addAssistantMessage,
      addStaffReply,
      addFormRequest,
      setStatus,
      markRead,
      resetLiveChat,
    }),
    [
      conversations,
      liveConversation,
      offeneAnzahl,
      addCustomerMessage,
      addAssistantMessage,
      addStaffReply,
      addFormRequest,
      setStatus,
      markRead,
      resetLiveChat,
    ],
  )

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>
}
