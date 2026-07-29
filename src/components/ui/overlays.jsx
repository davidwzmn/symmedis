import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn.js'
import { IconClose } from './Icons.jsx'
import { Button, IconButton } from './primitives.jsx'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Gemeinsame Overlay-Mechanik: Escape schließt, Tab bleibt gefangen,
 * Hintergrund scrollt nicht, Fokus kehrt zum Auslöser zurück.
 *
 * Bewusst auf Dokumentebene: wechselt der Inhalt eines Dialogs, verschwindet
 * das fokussierte Element und der Fokus fällt auf <body> – ein Handler am
 * Dialog-Element würde dann nicht mehr auslösen.
 */
function useOverlay(open, onClose, containerRef) {
  const restoreRef = useRef(null)

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const node = containerRef.current
      if (!node) return
      const list = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (list.length === 0) {
        event.preventDefault()
        node.focus({ preventScroll: true })
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement

      if (!node.contains(active)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose, containerRef],
  )

  useEffect(() => {
    if (!open) return undefined
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onKeyDown])

  useEffect(() => {
    if (!open) return undefined
    restoreRef.current = document.activeElement

    const body = document.body
    const prevOverflow = body.style.overflow
    const prevPad = body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    const frame = window.requestAnimationFrame(() => {
      const node = containerRef.current
      const target =
        node?.querySelector('[data-autofocus]') ?? node?.querySelector(FOCUSABLE) ?? node
      target?.focus?.({ preventScroll: true })
    })

    return () => {
      window.cancelAnimationFrame(frame)
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
      const restore = restoreRef.current
      if (restore?.focus && document.contains(restore)) restore.focus({ preventScroll: true })
    }
  }, [open, containerRef])
}

/* ------------------------------------------------------------------- Modal */

const MODAL_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-[76rem]',
}

export function Modal({ open, onClose, title, subtitle, size = 'md', footer, children }) {
  const ref = useRef(null)
  const titleId = useId()
  useOverlay(open, onClose, ref)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-80 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Dialog schließen"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[var(--c-overlay)] animate-fade-in"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line',
          'bg-surface shadow-pop outline-none animate-rise sm:max-h-[88vh] sm:rounded-2xl',
          MODAL_SIZES[size] ?? MODAL_SIZES.md,
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {title}
            </h2>
            {subtitle ? <p className="mt-0.5 text-[0.8125rem] text-ink-2">{subtitle}</p> : null}
          </div>
          <IconButton label="Schließen" size="sm" onClick={onClose}>
            <IconClose className="size-4" />
          </IconButton>
        </header>

        <div className="scroll-area min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

        {footer ? (
          <footer className="shrink-0 border-t border-line bg-surface-muted px-5 py-3">{footer}</footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

/* ------------------------------------------------------------------ Drawer */

/** Seitliches Panel für Detailansichten – auf Mobile als Bottom-Sheet. */
export function Drawer({ open, onClose, title, subtitle, footer, width = 'md', children }) {
  const ref = useRef(null)
  const titleId = useId()
  useOverlay(open, onClose, ref)

  if (!open) return null

  const widths = { md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-3xl' }

  return createPortal(
    <div className="fixed inset-0 z-80 flex justify-end">
      <button
        type="button"
        aria-label="Panel schließen"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[var(--c-overlay)] animate-fade-in"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative z-10 mt-auto flex h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line',
          'bg-surface shadow-pop outline-none animate-rise',
          'sm:mt-0 sm:h-full sm:rounded-none sm:rounded-l-2xl sm:border-y-0 sm:border-r-0',
          widths[width] ?? widths.md,
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {title}
            </h2>
            {subtitle ? <p className="mt-0.5 text-[0.8125rem] text-ink-2">{subtitle}</p> : null}
          </div>
          <IconButton label="Schließen" size="sm" onClick={onClose}>
            <IconClose className="size-4" />
          </IconButton>
        </header>

        <div className="scroll-area min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

        {footer ? (
          <footer className="shrink-0 border-t border-line bg-surface-muted px-5 py-3">{footer}</footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

/* ----------------------------------------------------------- ConfirmDialog */

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Bestätigen' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            size="sm"
            data-autofocus
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="px-5 py-5 text-sm leading-relaxed text-ink-2">{description}</p>
    </Modal>
  )
}

/* ----------------------------------------------------------------- Tooltip */

/** Tooltip für Zusatzinformation. Bei Tastaturfokus ebenso sichtbar wie bei Hover. */
export function Tooltip({ content, side = 'top', children }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      {open ? (
        <span
          role="tooltip"
          id={id}
          className={cn(
            'pointer-events-none absolute z-90 w-max max-w-[16rem] rounded-md bg-surface-inverse px-2 py-1',
            'text-[0.6875rem] leading-snug font-medium text-canvas shadow-md animate-fade-in',
            positions[side] ?? positions.top,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  )
}
