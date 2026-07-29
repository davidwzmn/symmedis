import { useEffect, useState } from 'react'

/**
 * Ermittelt den aktuell sichtbaren Abschnitt für den aktiven Navigationszustand.
 * Bewusst scroll-basiert (statt IntersectionObserver), damit auch sehr kurze
 * und sehr lange Abschnitte zuverlässig erkannt werden.
 */
export function useScrollSpy(ids, offset = 96) {
  const [activeId, setActiveId] = useState(ids[0] ?? null)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const scrollY = window.scrollY

      // Seitenende: immer der letzte Abschnitt
      if (window.innerHeight + scrollY >= document.body.scrollHeight - 2) {
        setActiveId(ids[ids.length - 1])
        return
      }

      let current = ids[0]
      for (const id of ids) {
        const element = document.getElementById(id)
        if (!element) continue
        if (element.getBoundingClientRect().top - offset <= 0) current = id
      }
      setActiveId(current)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids, offset])

  return activeId
}
