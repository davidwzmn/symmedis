export function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0 rounded-sm"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="7" className="fill-marine-800 dark:fill-marine-500" />
        <path
          d="M6 17h4.6l2.1-5.6 3.4 9.4 2.3-6 1.6 2.2H26"
          fill="none"
          className="stroke-brass-300 dark:stroke-night-950"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.0625rem] tracking-[0.02em] text-marine-950 dark:text-night-100">
          SYMMEDIS
        </span>
        <span className="mt-0.5 text-[0.625rem] font-medium tracking-[0.18em] text-shell-500 uppercase dark:text-night-300">
          Diagnosis OS
        </span>
      </span>
    </span>
  )
}
