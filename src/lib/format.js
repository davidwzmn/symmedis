/** Formatierung für Datum, Zahlen und relative Zeitangaben (de-DE). */

const dateFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
const dateShortFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' })
const timeFmt = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' })

/** Fixer Bezugszeitpunkt: Demo-Daten sollen stabil bleiben, nicht mit der Uhr wandern. */
export const HEUTE = new Date('2026-07-29T09:00:00')

export function formatDate(value) {
  return dateFmt.format(new Date(value))
}

export function formatDateShort(value) {
  return dateShortFmt.format(new Date(value))
}

export function formatTime(value) {
  return timeFmt.format(new Date(value))
}

/** „vor 2 Std.“, „in 3 Tagen“ – relativ zum fixen Demo-Zeitpunkt. */
export function formatRelative(value, jetzt = HEUTE) {
  const diffMs = new Date(value).getTime() - jetzt.getTime()
  const min = Math.round(diffMs / 60000)
  const abs = Math.abs(min)

  if (abs < 1) return 'gerade eben'
  if (abs < 60) return min < 0 ? `vor ${abs} Min.` : `in ${abs} Min.`

  const std = Math.round(abs / 60)
  if (std < 24) return min < 0 ? `vor ${std} Std.` : `in ${std} Std.`

  const tage = Math.round(std / 24)
  if (tage === 1) return min < 0 ? 'gestern' : 'morgen'
  if (tage < 30) return min < 0 ? `vor ${tage} Tagen` : `in ${tage} Tagen`

  const monate = Math.round(tage / 30)
  return min < 0 ? `vor ${monate} Mon.` : `in ${monate} Mon.`
}

/** Tage bis zu einem Datum (negativ = überfällig). */
export function tageBis(value, jetzt = HEUTE) {
  const ms = new Date(value).setHours(0, 0, 0, 0) - new Date(jetzt).setHours(0, 0, 0, 0)
  return Math.round(ms / 86400000)
}

export function formatNumber(value, opts = {}) {
  return new Intl.NumberFormat('de-DE', opts).format(value)
}

export function formatPercent(value) {
  return `${Math.round(value)} %`
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Initialen für Avatare: „Katrin Ahlers“ → „KA“. */
export function initialen(name) {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((teil) => teil[0].toUpperCase())
    .join('')
}
