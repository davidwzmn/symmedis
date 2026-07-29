/** Sanftes Scrollen zu einem Abschnitt – respektiert reduzierte Bewegung. */
export function scrollToSection(id) {
  const element = document.getElementById(id)
  if (!element) return
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })

  // Fokus setzen, damit Tastaturnutzung dem Sprung folgt.
  element.setAttribute('tabindex', '-1')
  element.focus({ preventScroll: true })
  element.addEventListener('blur', () => element.removeAttribute('tabindex'), { once: true })
}
