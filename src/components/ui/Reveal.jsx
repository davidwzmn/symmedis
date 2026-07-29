import { useEffect, useRef, useState } from 'react'

/**
 * Blendet Inhalte beim Erreichen des Viewports sanft ein.
 * Ohne IntersectionObserver (oder bei reduzierter Bewegung) ist der Inhalt
 * sofort sichtbar – es kann nie etwas unsichtbar hängen bleiben.
 */
export function Reveal({ as: Component = 'div', delay = 0, className = '', children, ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    if (visible) return undefined
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [visible])

  return (
    <Component
      ref={ref}
      className={`${visible ? 'animate-fade-up' : 'opacity-0'} ${className}`}
      style={visible && delay ? { animationDelay: `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </Component>
  )
}
