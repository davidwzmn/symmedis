/** Fügt Klassennamen zusammen und verwirft leere Werte. */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}
