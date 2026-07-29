import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { IconBuilding, IconChevronRight, IconSearch } from '../ui/Icons.jsx'
import { Kbd } from '../ui/primitives.jsx'

/**
 * Globale Suche (⌘K / Strg+K): Bereiche, Kunden und Aufgaben.
 * Vollständig mit der Tastatur bedienbar.
 *
 * `kundenBereich` begrenzt die Suche auf einen einzelnen Mandanten. Im
 * Kundenportal darf die Suche keine fremden Kunden zurückgeben – deshalb wird
 * die Kundengruppe dort nicht aufgebaut.
 */
export function CommandPalette({ offen, onClose, ziele, kundenBereich = null, aufgabenZiel }) {
  const { kunden } = useWorkspace()
  const [suche, setSuche] = useState('')
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const listRef = useRef(null)

  const treffer = useMemo(() => {
    const q = suche.trim().toLowerCase()
    const bereiche = ziele
      .filter((z) => !q || z.label.toLowerCase().includes(q))
      .map((z) => ({ id: `nav-${z.to}`, gruppe: 'Bereiche', label: z.label, to: z.to, icon: z.icon }))

    const sichtbar = kundenBereich ? kunden.filter((k) => k.id === kundenBereich) : kunden

    const kundenTreffer = kundenBereich
      ? []
      : sichtbar
          .filter(
            (k) =>
              !q ||
              k.unternehmen.toLowerCase().includes(q) ||
              k.branche.toLowerCase().includes(q) ||
              k.ansprechpartner.name.toLowerCase().includes(q),
          )
          .map((k) => ({
            id: `kunde-${k.id}`,
            gruppe: 'Kunden',
            label: k.unternehmen,
            hinweis: k.branche,
            to: `/intern/kunden/${k.id}`,
            icon: IconBuilding,
          }))

    const aufgaben = q
      ? sichtbar
          .flatMap((k) => k.aufgaben.map((a) => ({ ...a, unternehmen: k.unternehmen, kundeId: k.id })))
          .filter((a) => a.titel.toLowerCase().includes(q))
          .slice(0, 5)
          .map((a) => ({
            id: `task-${a.id}`,
            gruppe: 'Aufgaben',
            label: a.titel,
            hinweis: a.unternehmen,
            to: aufgabenZiel ?? `/intern/kunden/${a.kundeId}`,
          }))
      : []

    return [...bereiche, ...kundenTreffer, ...aufgaben].slice(0, 12)
  }, [suche, kunden, ziele, kundenBereich, aufgabenZiel])

  useEffect(() => setIndex(0), [suche])

  useEffect(() => {
    if (!offen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setIndex((i) => Math.min(i + 1, treffer.length - 1))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setIndex((i) => Math.max(i - 1, 0))
      } else if (event.key === 'Enter' && treffer[index]) {
        event.preventDefault()
        navigate(treffer[index].to)
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [offen, treffer, index, navigate, onClose])

  useEffect(() => {
    if (offen) setSuche('')
  }, [offen])

  if (!offen) return null

  let letzteGruppe = null

  return createPortal(
    <div className="fixed inset-0 z-90 flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Suche schließen"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[var(--c-overlay)] animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Globale Suche"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-pop animate-rise"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <IconSearch className="size-4 shrink-0 text-ink-3" />
          <input
            autoFocus
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Kunden, Bereiche oder Aufgaben suchen …"
            aria-label="Suchbegriff"
            className="h-12 w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
          <Kbd>Esc</Kbd>
        </div>

        <ul ref={listRef} className="scroll-area max-h-[22rem] overflow-y-auto py-1.5">
          {treffer.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-ink-3">
              Keine Treffer für „{suche}“.
            </li>
          ) : (
            treffer.map((eintrag, i) => {
              const neueGruppe = eintrag.gruppe !== letzteGruppe
              letzteGruppe = eintrag.gruppe
              return (
                <li key={eintrag.id}>
                  {neueGruppe ? (
                    <p className="px-4 pt-2.5 pb-1 text-[0.6875rem] font-semibold text-ink-3">
                      {eintrag.gruppe}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => {
                      navigate(eintrag.to)
                      onClose()
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2 text-left',
                      i === index ? 'bg-brand-soft' : 'hover:bg-surface-muted',
                    )}
                  >
                    {eintrag.icon ? (
                      <eintrag.icon className="size-4 shrink-0 text-ink-3" />
                    ) : (
                      <span className="size-4 shrink-0" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] text-ink">{eintrag.label}</span>
                      {eintrag.hinweis ? (
                        <span className="block truncate text-xs text-ink-3">{eintrag.hinweis}</span>
                      ) : null}
                    </span>
                    <IconChevronRight className="size-4 shrink-0 text-ink-3" />
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </div>,
    document.body,
  )
}
