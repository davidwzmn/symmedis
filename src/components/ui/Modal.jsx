import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconClose } from './Icons.jsx'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const SIZES = {
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
}

/**
 * Dialog mit vollständigem Fokus-Management:
 * Escape schließt, Tab bleibt im Dialog gefangen, der Fokus kehrt beim
 * Schließen an das auslösende Element zurück, der Hintergrund scrollt nicht.
 */
export function Modal({ open, onClose, title, subtitle, size = 'lg', children, footer }) {
  const dialogRef = useRef(null)
  const restoreFocusRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  /**
   * Tastatursteuerung bewusst auf Dokumentebene: Wechselt der Inhalt des
   * Dialogs (z. B. Formular → Ergebnis), verschwindet das fokussierte Element
   * und der Fokus fällt auf <body>. Ein Handler am Dialog-Element würde dann
   * nicht mehr auslösen – Escape und der Fokus-Trap wären wirkungslos.
   */
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return

      const list = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
        (node) => node.offsetParent !== null || node === document.activeElement,
      )
      if (list.length === 0) {
        event.preventDefault()
        dialog.focus({ preventScroll: true })
        return
      }

      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement

      // Fokus außerhalb des Dialogs (z. B. auf <body>) wieder einfangen.
      if (!dialog.contains(active)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return undefined
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  useEffect(() => {
    if (!open) return undefined

    restoreFocusRef.current = document.activeElement
    const body = document.body
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    const frame = window.requestAnimationFrame(() => {
      const target =
        dialogRef.current?.querySelector('[data-autofocus]') ??
        dialogRef.current?.querySelector(FOCUSABLE) ??
        dialogRef.current
      target?.focus?.({ preventScroll: true })
    })

    return () => {
      window.cancelAnimationFrame(frame)
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
      const restore = restoreFocusRef.current
      if (restore && typeof restore.focus === 'function' && document.contains(restore)) {
        restore.focus({ preventScroll: true })
      }
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Dialog schließen"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-marine-950/55 backdrop-blur-[2px] animate-fade-in"
        tabIndex={-1}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? descriptionId : undefined}
        tabIndex={-1}
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-lg border border-shell-200 bg-white shadow-2xl outline-none animate-fade-up sm:max-h-[88vh] sm:rounded-lg dark:border-night-700 dark:bg-night-900 ${SIZES[size] ?? SIZES.lg}`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-shell-200 px-5 py-4 sm:px-7 sm:py-5 dark:border-night-700">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg leading-snug sm:text-xl">
              {title}
            </h2>
            {subtitle ? (
              <p id={descriptionId} className="mt-1 text-sm prose-muted">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="-mt-1 -mr-1 shrink-0 rounded-sm p-2 text-shell-500 transition-colors hover:bg-shell-100 hover:text-marine-900 dark:text-night-300 dark:hover:bg-night-800 dark:hover:text-night-100"
          >
            <IconClose className="size-5" />
          </button>
        </header>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 border-t border-shell-200 px-5 py-4 sm:px-7 dark:border-night-700">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
