import { cn } from '../../lib/cn.js'
import { tone } from '../../lib/tone.js'
import { initialen } from '../../lib/format.js'

/* ------------------------------------------------------------------ Button */

const BUTTON_VARIANTS = {
  primary:
    'bg-brand text-on-brand border border-brand hover:bg-brand-hover hover:border-brand-hover active:bg-brand-active',
  // Primärer Handlungsaufruf im Corporate Design: Lime-Fläche, Navy-Text.
  cta:
    'bg-cta text-on-cta border border-cta-border hover:bg-cta-hover hover:border-cta-hover active:bg-cta-active font-semibold',
  secondary:
    'bg-surface text-ink border border-line-strong hover:border-brand hover:text-brand-ink',
  ghost: 'bg-transparent text-ink-2 border border-transparent hover:bg-surface-muted hover:text-ink',
  subtle: 'bg-surface-muted text-ink border border-transparent hover:bg-surface-sunken',
  accent:
    'bg-accent text-on-accent border border-accent hover:bg-accent-hover hover:border-accent-hover',
  danger:
    'bg-surface text-danger-ink border border-danger-border hover:bg-danger-soft',
  inverse:
    'bg-surface-inverse text-canvas border border-surface-inverse hover:opacity-90',
  // Für Flächen, die selbst schon invertiert sind (dunkle Karten im Marketing)
  'on-dark': 'bg-canvas text-ink border border-canvas hover:bg-surface',
}

const BUTTON_SIZES = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  sm: 'h-8 px-3 text-[0.8125rem] gap-1.5 rounded-md',
  md: 'h-9.5 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-[0.9375rem] gap-2 rounded-lg',
}

export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}) {
  if (Component === 'button' && props.type === undefined) props.type = 'button'
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center text-center font-medium',
        'transition-[background-color,border-color,color,box-shadow] duration-150',
        'disabled:opacity-50 disabled:pointer-events-none',
        BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary,
        BUTTON_SIZES[size] ?? BUTTON_SIZES.md,
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

/** Quadratischer Button für reine Icon-Aktionen – `label` ist Pflicht. */
export function IconButton({ label, size = 'md', variant = 'ghost', className, children, ...props }) {
  const sizes = { sm: 'size-7 rounded-md', md: 'size-9 rounded-lg', lg: 'size-10 rounded-lg' }
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center transition-colors duration-150',
        'disabled:opacity-50 disabled:pointer-events-none',
        BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.ghost,
        sizes[size] ?? sizes.md,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* -------------------------------------------------------------------- Chip */

/**
 * Status-Chip. Trägt immer Text – Farbe ist nie der alleinige Informationsträger.
 * Optional zusätzlich ein Punkt oder Icon.
 */
export function Chip({ toneName = 'neutral', icon: Icon, dot = false, size = 'md', className, children }) {
  const t = tone(toneName)
  const sizes = {
    sm: 'h-5 px-1.5 text-[0.6875rem] gap-1',
    md: 'h-6 px-2 text-xs gap-1.5',
    lg: 'h-7 px-2.5 text-[0.8125rem] gap-1.5',
  }
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-md border font-medium whitespace-nowrap',
        t.chip,
        sizes[size] ?? sizes.md,
        className,
      )}
    >
      {dot ? <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', t.dot)} /> : null}
      {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
      <span className="truncate">{children}</span>
    </span>
  )
}

/** Zähler-Badge, z. B. für ungelesene Nachrichten. */
export function CountBadge({ value, toneName = 'brand', className }) {
  if (!value) return null
  const t = tone(toneName)
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-semibold tabular',
        t.solid,
        className,
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  )
}

/* ------------------------------------------------------------------ Avatar */

const AVATAR_TONES = [
  'bg-brand-soft text-brand-ink',
  'bg-accent-soft text-accent-ink',
  'bg-info-soft text-info-ink',
  'bg-ok-soft text-ok-ink',
  'bg-neutral-soft text-neutral-ink',
]

export function Avatar({ name, size = 'md', className }) {
  const sizes = {
    xs: 'size-6 text-[0.625rem]',
    sm: 'size-7 text-[0.6875rem]',
    md: 'size-9 text-xs',
    lg: 'size-11 text-sm',
  }
  // Stabile Farbwahl aus dem Namen – gleiche Person, gleiche Farbe.
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i)) % AVATAR_TONES.length

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        AVATAR_TONES[hash],
        sizes[size] ?? sizes.md,
        className,
      )}
    >
      {initialen(name)}
    </span>
  )
}

/* --------------------------------------------------------------------- Kbd */

export function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-strong bg-surface-muted px-1.5 font-sans text-[0.6875rem] font-medium text-ink-3">
      {children}
    </kbd>
  )
}

/* ----------------------------------------------------------------- Spinner */

export function Spinner({ className = 'size-4', label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg className={cn(className, 'animate-spin')} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2.4" />
        <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      {label ? <span>{label}</span> : null}
    </span>
  )
}

export function TypingDots({ label = 'Antwort wird erstellt' }) {
  return (
    <span className="inline-flex items-center gap-1" role="status" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-pulse rounded-full bg-current"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  )
}
