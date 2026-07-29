import { createContext } from 'react'

/**
 * Gemeinsamer Zustand für Kundenchat, interne Mitarbeiteransicht und
 * Formular-Eingänge. Alles ausschließlich im React-State – kein
 * localStorage, kein Backend.
 */
export const InboxContext = createContext(null)

export const LIVE_CONVERSATION_ID = 'live-chat'
