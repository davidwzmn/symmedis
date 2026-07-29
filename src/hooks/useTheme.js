import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'symmedis-theme'

/**
 * Hell/Dunkel-Umschaltung. Standard ist bewusst der helle Modus;
 * eine bewusste Nutzerentscheidung wird gespeichert.
 *
 * Der Zustand liegt in einem Modul-Store statt in useState: Topbar,
 * Marketing-Kopfzeile und Login greifen gleichzeitig darauf zu und müssen
 * denselben Wert sehen.
 */

function gespeichert() {
  try {
    const wert = window.localStorage.getItem(STORAGE_KEY)
    return wert === 'dark' || wert === 'light' ? wert : null
  } catch {
    return null
  }
}

let aktuell = gespeichert() ?? 'light'
const hoerer = new Set()

function anwenden(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* Speicher nicht verfügbar – die Umschaltung funktioniert trotzdem. */
  }
}

anwenden(aktuell)

function subscribe(listener) {
  hoerer.add(listener)
  return () => hoerer.delete(listener)
}

function setTheme(theme) {
  if (theme === aktuell) return
  aktuell = theme
  anwenden(theme)
  hoerer.forEach((listener) => listener())
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    () => aktuell,
    () => 'light',
  )

  const toggleTheme = useCallback(() => setTheme(aktuell === 'dark' ? 'light' : 'dark'), [])

  return { theme, toggleTheme, setTheme }
}
