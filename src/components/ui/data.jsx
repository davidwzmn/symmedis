import { useId } from 'react'
import { cn } from '../../lib/cn.js'
import { tone } from '../../lib/tone.js'
import { IconChevronDown, IconChevronRight } from './Icons.jsx'

/* -------------------------------------------------------------------- Tabs */

/**
 * Register.
 *
 * Ab `md` als klassische Reiterleiste. Darunter als Auswahlfeld: eine Leiste
 * mit zwölf Registern würde auf dem Telefon zu einem horizontalen Scrollbereich
 * werden, in dem die hinteren Register praktisch unauffindbar sind.
 */
export function Tabs({ items, value, onChange, className, size = 'md', label = 'Ansicht wählen' }) {
  const sizes = { sm: 'py-2 text-[0.8125rem]', md: 'py-2.5 text-sm' }
  const feldId = useId()

  return (
    <div className={cn('min-w-0', className)}>
      {/* Mobile */}
      <div className="md:hidden">
        <label htmlFor={feldId} className="mb-1.5 block text-xs font-medium text-ink-2">
          {label}
        </label>
        <div className="relative">
          <select
            id={feldId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-9.5 w-full appearance-none rounded-lg border border-line-strong bg-surface pr-9 pl-3 text-sm font-medium text-ink focus:border-brand focus:outline-none"
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
                {item.count !== undefined ? ` (${item.count})` : ''}
              </option>
            ))}
          </select>
          <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-3" />
        </div>
      </div>

      {/* Ab Tablet */}
      <div className="scroll-area -mb-px hidden overflow-x-auto border-b border-line md:block">
        <div role="tablist" aria-label={label} className="flex min-w-max gap-1">
          {items.map((item) => {
            const aktiv = item.id === value
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={aktiv}
                onClick={() => onChange(item.id)}
                className={cn(
                  'inline-flex items-center gap-2 border-b-2 px-3 font-medium whitespace-nowrap transition-colors duration-150',
                  sizes[size] ?? sizes.md,
                  aktiv
                    ? 'border-brand text-brand-ink'
                    : 'border-transparent text-ink-3 hover:border-line-strong hover:text-ink',
                )}
              >
                {item.icon ? <item.icon className="size-4" /> : null}
                {item.label}
                {item.count !== undefined ? (
                  <span
                    className={cn(
                      'tabular rounded px-1.5 py-0.5 text-[0.6875rem]',
                      aktiv ? 'bg-brand-soft text-brand-ink' : 'bg-surface-muted text-ink-3',
                    )}
                  >
                    {item.count}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- DataTable */

/**
 * Tabelle für Desktop, Kartenliste für Mobile – dieselbe Datenquelle.
 * Spalten mit `hideBelow: 'lg'` erscheinen erst ab der jeweiligen Breite.
 */
export function DataTable({ columns, rows, getKey, onRowClick, renderCard, empty, caption }) {
  const captionId = useId()

  if (rows.length === 0 && empty) return empty

  const versteck = {
    sm: 'hidden sm:table-cell',
    md: 'hidden md:table-cell',
    lg: 'hidden lg:table-cell',
    xl: 'hidden xl:table-cell',
  }

  return (
    <>
      {/* Desktop */}
      <div className="scroll-area hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          {caption ? (
            <caption id={captionId} className="sr-only">
              {caption}
            </caption>
          ) : null}
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-ink-2',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.hideBelow && versteck[col.hideBelow],
                  )}
                >
                  {col.label}
                </th>
              ))}
              {onRowClick ? <th scope="col" className="w-9" /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-line last:border-0',
                  onRowClick && 'cursor-pointer transition-colors hover:bg-surface-muted',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-3 py-3 align-middle',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.hideBelow && versteck[col.hideBelow],
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
                {onRowClick ? (
                  <td className="px-2 text-right">
                    <span className="inline-flex text-ink-3">
                      <IconChevronRight className="size-4" />
                    </span>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-line md:hidden">
        {rows.map((row) => (
          <li key={getKey(row)}>
            {onRowClick ? (
              <button
                type="button"
                onClick={() => onRowClick(row)}
                className="w-full px-4 py-3.5 text-left transition-colors hover:bg-surface-muted"
              >
                {renderCard(row)}
              </button>
            ) : (
              <div className="px-4 py-3.5">{renderCard(row)}</div>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

/* ------------------------------------------------------------- ProgressBar */

/** Fortschrittsbalken mit sichtbarem Wert – Farbe ist nie alleiniger Träger. */
export function ProgressBar({
  value,
  toneName = 'brand',
  size = 'md',
  showValue = false,
  label,
  hideLabel = false,
  className,
  animate = true,
}) {
  const t = tone(toneName)
  const hoehen = { xs: 'h-1', sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' }
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={className}>
      {(label && !hideLabel) || showValue ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {label && !hideLabel ? <span className="text-xs text-ink-2">{label}</span> : <span />}
          {showValue ? (
            <span className="tabular text-xs font-medium text-ink">{Math.round(clamped)} %</span>
          ) : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Fortschritt'}
        className={cn('w-full overflow-hidden rounded-full bg-viz-track', hoehen[size] ?? hoehen.md)}
      >
        <div
          className={cn('h-full rounded-full', t.bar, animate && 'origin-left animate-grow-x')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- KeyValue */

export function KeyValueList({ items, className, columns = 1 }) {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-3',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-ink-3">{item.label}</dt>
          <dd className="mt-0.5 text-[0.8125rem] font-medium break-words text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ---------------------------------------------------------------- Timeline */

export function Timeline({ items, className }) {
  return (
    <ol className={cn('relative space-y-4', className)}>
      <span
        aria-hidden="true"
        className="absolute top-1.5 bottom-1.5 left-[0.4375rem] w-px bg-line"
      />
      {items.map((item) => {
        const t = tone(item.tone ?? 'neutral')
        return (
          <li key={item.id} className="relative flex gap-3.5 pl-0">
            <span
              aria-hidden="true"
              className={cn(
                'relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2 border-surface',
                t.dot,
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[0.8125rem] leading-snug text-ink">{item.title}</p>
              <p className="mt-0.5 text-xs text-ink-3">
                {item.actor ? <span className="font-medium text-ink-2">{item.actor}</span> : null}
                {item.actor && item.time ? ' · ' : null}
                {item.time}
              </p>
              {item.detail ? (
                <p className="mt-1 text-xs leading-relaxed text-ink-2">{item.detail}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
