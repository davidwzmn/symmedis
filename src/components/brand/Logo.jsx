import { cn } from '../../lib/cn.js'

/** Wortmarke mit Signet. `bereich` benennt den aktuellen Kontext (Demo, Portal …). */
export function Logo({ compact = false, bereich, className }) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="8" fill="var(--c-brand)" />
        <path
          d="M6.5 17.5h4l2-6 3.5 10 2.5-6.5 1.6 2.5h5.4"
          fill="none"
          stroke="var(--c-on-brand)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className={cn('flex min-w-0 flex-col leading-none', compact && 'hidden lg:flex')}>
        <span className="truncate text-sm font-semibold tracking-tight text-ink">SYMMEDIS</span>
        <span className="mt-0.5 truncate text-[0.6875rem] font-medium text-ink-3">
          {bereich ?? 'Diagnosis OS'}
        </span>
      </span>
    </span>
  )
}
