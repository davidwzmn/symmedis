import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'symmedis-theme'

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'dark' || stored === 'light' ? stored : null
  } catch {
    return null
  }
}

/**
 * Hell/Dunkel-Umschaltung. Standard ist bewusst der helle Modus;
 * eine bewusste Nutzerentscheidung wird gespeichert.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => readStoredTheme() ?? 'light')

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* Speicher nicht verfügbar – Umschaltung funktioniert trotzdem. */
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
