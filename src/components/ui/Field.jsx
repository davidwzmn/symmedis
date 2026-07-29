import { IconAlert } from './Icons.jsx'

export const controlClasses =
  'w-full rounded-sm border bg-white px-3.5 py-2.5 text-[0.9375rem] text-marine-950 placeholder:text-shell-400 transition-colors dark:bg-night-900 dark:text-night-100 dark:placeholder:text-night-300/70'

export const controlBorder =
  'border-shell-300 hover:border-shell-400 focus:border-marine-600 dark:border-night-600 dark:hover:border-night-600 dark:focus:border-marine-400'

export const controlBorderError = 'border-[#b4462f] dark:border-[#e08a72]'

/** Formularfeld mit Label, optionalem Hinweis und Fehlermeldung. */
export function Field({ id, label, hint, error, required = false, children }) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[0.8125rem] font-medium text-marine-900 dark:text-night-200"
      >
        {label}
        {required ? (
          <span className="ml-1 text-brass-600 dark:text-brass-400" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-[0.75rem] font-normal text-shell-500 dark:text-night-300">
            (optional)
          </span>
        )}
      </label>

      <div className="mt-1.5">{children({ hintId, errorId })}</div>

      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-[0.75rem] prose-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          className="mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-[#b4462f] dark:text-[#e08a72]"
        >
          <IconAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  )
}
