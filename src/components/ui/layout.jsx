import { cn } from '../../lib/cn.js'
import { tone } from '../../lib/tone.js'
import { IconTrendDown, IconTrendUp } from './Icons.jsx'

/* -------------------------------------------------------------------- Card */

export function Card({ as: Component = 'div', className, children, ...props }) {
  return (
    <Component
      className={cn(
        // min-w-0: Grid- und Flex-Kinder haben min-width:auto und würden sonst
        // auf ihre Min-Content-Breite wachsen und die Spalte sprengen.
        'min-w-0 rounded-card border border-line bg-surface shadow-xs',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon, className }) {
  return (
    <div
      className={cn(
        // flex-wrap: schmale Spalten setzen die Aktion unter den Titel,
        // statt die Karte breiter zu machen.
        'flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        {Icon ? (
          <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-ink-2">
            <Icon className="size-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          {/* h2, damit auf die h1 der Seite keine Ebene übersprungen wird */}
          <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
          {subtitle ? <p className="mt-0.5 truncate text-xs text-ink-3">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={cn('px-4 py-4 sm:px-5', className)}>{children}</div>
}

/* -------------------------------------------------------------- PageHeader */

export function PageHeader({ title, subtitle, actions, meta, className }) {
  return (
    <header className={cn('flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-[1.375rem]">{title}</h1>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-sm text-ink-2">{subtitle}</p> : null}
        {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

/* -------------------------------------------------------------- MetricCard */

/**
 * Kennzahl-Kachel. Die Veränderung wird durch Icon **und** Text getragen,
 * nicht durch Farbe allein.
 */
export function MetricCard({
  label,
  value,
  unit,
  hint,
  delta,
  deltaLabel,
  icon: Icon,
  toneName = 'neutral',
  footer,
  className,
}) {
  const t = tone(toneName)
  const richtung = delta === undefined ? null : delta >= 0 ? 'up' : 'down'
  const TrendIcon = richtung === 'up' ? IconTrendUp : IconTrendDown

  return (
    <div className={cn('min-w-0 rounded-card border border-line bg-surface p-4 shadow-xs', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-ink-2">{label}</p>
        {Icon ? (
          <span className={cn('inline-flex size-7 items-center justify-center rounded-md', t.soft, t.text)}>
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>

      <p className="mt-2.5 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight text-ink tabular">{value}</span>
        {unit ? <span className="text-sm font-medium text-ink-3">{unit}</span> : null}
      </p>

      {delta !== undefined || hint ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {delta !== undefined ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-medium',
                richtung === 'up' ? 'text-ok-ink' : 'text-urgent-ink',
              )}
            >
              <TrendIcon className="size-3.5" />
              {delta >= 0 ? '+' : ''}
              {delta}
              {deltaLabel ? <span className="font-normal text-ink-3">{deltaLabel}</span> : null}
            </span>
          ) : null}
          {hint ? <span className="text-ink-3">{hint}</span> : null}
        </div>
      ) : null}

      {footer ? <div className="mt-3 border-t border-line pt-3">{footer}</div> : null}
    </div>
  )
}

/* -------------------------------------------------------------- EmptyState */

export function EmptyState({ icon: Icon, title, description, action, className, compact = false }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-4 py-8' : 'px-6 py-14',
        className,
      )}
    >
      {Icon ? (
        <span className="inline-flex size-11 items-center justify-center rounded-xl border border-line bg-surface-muted text-ink-3">
          <Icon className="size-5" />
        </span>
      ) : null}
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-ink-2">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

/* ---------------------------------------------------------------- Skeleton */

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />
}

export function SkeletonRows({ rows = 4, className }) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Inhalte werden geladen">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------- Info-Banner */

export function Banner({ toneName = 'info', icon: Icon, title, children, action, className }) {
  const t = tone(toneName)
  return (
    <div
      className={cn('flex min-w-0 flex-col gap-3 rounded-lg border p-3.5 sm:flex-row sm:items-center', t.chip, className)}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        {Icon ? <Icon className="mt-0.5 size-4 shrink-0" /> : null}
        <div className="min-w-0">
          {title ? <p className="text-[0.8125rem] font-semibold">{title}</p> : null}
          <p className="text-[0.8125rem] leading-relaxed opacity-90">{children}</p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

/* -------------------------------------------------------- Abschnitts-Titel */

export function SectionTitle({ children, action, className }) {
  return (
    <div className={cn('mb-3 flex items-baseline justify-between gap-3', className)}>
      <h2 className="text-sm font-semibold text-ink">{children}</h2>
      {action}
    </div>
  )
}
