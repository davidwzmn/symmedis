const VARIANTS = {
  primary:
    'bg-marine-800 text-white border border-marine-800 hover:bg-marine-900 hover:border-marine-900 active:bg-marine-950 dark:bg-marine-400 dark:border-marine-400 dark:text-night-950 dark:hover:bg-marine-300 dark:hover:border-marine-300',
  secondary:
    'bg-transparent text-marine-900 border border-shell-300 hover:border-marine-700 hover:bg-marine-50 dark:text-night-100 dark:border-night-600 dark:hover:border-marine-400 dark:hover:bg-night-800',
  accent:
    'bg-brass-500 text-white border border-brass-500 hover:bg-brass-600 hover:border-brass-600 dark:bg-brass-400 dark:border-brass-400 dark:text-night-950 dark:hover:bg-brass-300 dark:hover:border-brass-300',
  ghost:
    'bg-transparent text-marine-800 border border-transparent hover:bg-shell-100 dark:text-night-200 dark:hover:bg-night-800',
  danger:
    'bg-transparent text-[#b4462f] border border-[#b4462f]/40 hover:bg-[#b4462f]/8 dark:text-[#e08a72] dark:border-[#e08a72]/40 dark:hover:bg-[#e08a72]/10',
}

const SIZES = {
  sm: 'text-[0.8125rem] px-3.5 py-2 gap-1.5',
  md: 'text-sm px-5 py-2.5 gap-2',
  lg: 'text-[0.9375rem] px-6 py-3 gap-2.5',
}

/**
 * Einheitlicher Button – rendert wahlweise als <button> oder <a>.
 * Jede Instanz hat eine echte Aktion; es gibt keine toten Zustände.
 */
export function Button({
  as = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  children,
  ...props
}) {
  const Component = as
  const classes = [
    'inline-flex items-center justify-center rounded-sm font-medium tracking-[0.01em]',
    'transition-[background-color,border-color,color,transform] duration-200',
    'disabled:opacity-55 disabled:pointer-events-none active:translate-y-px',
    // Bewusst KEIN whitespace-nowrap: lange deutsche CTA-Texte würden sonst
    // eine unteilbare Mindestbreite erzwingen und schmale Viewports sprengen.
    'text-center',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (Component === 'button' && props.type === undefined) {
    props.type = 'button'
  }

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}
