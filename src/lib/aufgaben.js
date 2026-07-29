import { formatDate, tageBis } from './format.js'

/**
 * Fälligkeit einer Aufgabe als Label + Ton.
 * Überfälligkeit schlägt den gespeicherten Status – sie ist die relevantere
 * Information und wird deshalb zusätzlich mit Icon und Text ausgewiesen.
 */
export function faelligkeit(aufgabe) {
  if (aufgabe.status === 'erledigt') return { label: 'Erledigt', tone: 'ok', ueberfaellig: false }

  const tage = tageBis(aufgabe.faellig)
  if (tage < 0) {
    return { label: `${Math.abs(tage)} Tage überfällig`, tone: 'urgent', ueberfaellig: true }
  }
  if (tage === 0) return { label: 'Heute fällig', tone: 'warn', ueberfaellig: false }
  if (tage <= 3) return { label: `in ${tage} Tagen`, tone: 'warn', ueberfaellig: false }
  return { label: formatDate(aufgabe.faellig), tone: 'neutral', ueberfaellig: false }
}

/** Nächster Status beim Weiterschalten einer Aufgabe. */
export function naechsterStatus(status) {
  if (status === 'erledigt') return 'offen'
  if (status === 'offen') return 'in-arbeit'
  return 'erledigt'
}
