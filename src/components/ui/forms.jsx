import { useId } from 'react'
import { cn } from '../../lib/cn.js'
import { IconAlert, IconChevronDown, IconSearch } from './Icons.jsx'

const CONTROL_BASE =
  'w-full rounded-lg border bg-surface text-ink placeholder:text-ink-3/80 transition-colors duration-150 ' +
  'hover:border-line-strong focus:border-brand focus:outline-none'

const CONTROL_SIZE = {
  sm: 'h-8 px-2.5 text-[0.8125rem]',
  md: 'h-9.5 px-3 text-sm',
  lg: 'h-11 px-3.5 text-[0.9375rem]',
}

function Wrapper({ id, label, hint, error, required, children, className }) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-[0.8125rem] font-medium text-ink">
          {label}
          {required ? (
            <span className="ml-0.5 text-urgent-ink" aria-hidden="true">
              *
            </span>
          ) : (
            <span className="ml-1.5 text-xs font-normal text-ink-3">optional</span>
          )}
        </label>
      ) : null}

      {children({ hintId, errorId })}

      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-xs text-ink-3">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-xs text-danger-ink">
          <IconAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function Input({ label, hint, error, required, size = 'md', className, id, ...props }) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <Wrapper
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {({ hintId, errorId }) => (
        <input
          id={fieldId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId ?? hintId}
          className={cn(
            CONTROL_BASE,
            CONTROL_SIZE[size],
            error ? 'border-danger' : 'border-line-strong',
          )}
          {...props}
        />
      )}
    </Wrapper>
  )
}

export function Textarea({ label, hint, error, required, rows = 4, className, id, ...props }) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <Wrapper
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {({ hintId, errorId }) => (
        <textarea
          id={fieldId}
          rows={rows}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId ?? hintId}
          className={cn(
            CONTROL_BASE,
            'resize-y px-3 py-2.5 text-sm leading-relaxed',
            error ? 'border-danger' : 'border-line-strong',
          )}
          {...props}
        />
      )}
    </Wrapper>
  )
}

export function Select({ label, hint, error, required, size = 'md', className, id, children, ...props }) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <Wrapper
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {({ hintId, errorId }) => (
        <div className="relative">
          <select
            id={fieldId}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={errorId ?? hintId}
            className={cn(
              CONTROL_BASE,
              CONTROL_SIZE[size],
              'appearance-none pr-9',
              error ? 'border-danger' : 'border-line-strong',
            )}
            {...props}
          >
            {children}
          </select>
          <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-3" />
        </div>
      )}
    </Wrapper>
  )
}

/** Suchfeld mit Icon – für Tabellen- und Listenfilter. */
export function SearchInput({ value, onChange, placeholder = 'Suchen …', label, className, ...props }) {
  const id = useId()
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label ?? placeholder}
      </label>
      <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(CONTROL_BASE, 'h-9 border-line-strong pr-3 pl-9 text-sm')}
        {...props}
      />
    </div>
  )
}

/** Segmentierte Umschaltung (Filter, Ansichtswechsel). */
export function Segmented({ options, value, onChange, label, size = 'md', className }) {
  const sizes = {
    sm: 'h-7 px-2 text-[0.6875rem]',
    md: 'h-8 px-3 text-xs',
  }
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('inline-flex rounded-lg border border-line bg-surface-muted p-0.5', className)}
    >
      {options.map((option) => {
        const aktiv = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={aktiv}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md font-medium transition-colors duration-150',
              sizes[size] ?? sizes.md,
              aktiv
                ? 'bg-surface text-ink shadow-xs'
                : 'text-ink-3 hover:text-ink',
            )}
          >
            {option.icon ? <option.icon className="size-3.5" /> : null}
            {option.label}
            {option.count !== undefined ? (
              <span className="tabular text-ink-3">{option.count}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/** Schalter für binäre Einstellungen. */
export function Toggle({ checked, onChange, label, description, id }) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={fieldId} className="text-[0.8125rem] font-medium text-ink">
          {label}
        </label>
        {description ? <p className="mt-0.5 text-xs text-ink-3">{description}</p> : null}
      </div>
      <button
        id={fieldId}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5.5 w-10 shrink-0 rounded-full border transition-colors duration-200',
          checked ? 'border-brand bg-brand' : 'border-line-strong bg-surface-sunken',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-0.5 size-4 rounded-full bg-surface shadow-sm transition-[left] duration-200',
            checked ? 'left-[1.375rem]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  )
}

export function Checkbox({ checked, onChange, label, id, className }) {
  const generated = useId()
  const fieldId = id ?? generated
  return (
    <label htmlFor={fieldId} className={cn('flex cursor-pointer items-start gap-2.5', className)}>
      <input
        id={fieldId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-line-strong accent-[var(--c-brand)]"
      />
      <span className="text-[0.8125rem] leading-snug text-ink">{label}</span>
    </label>
  )
}
