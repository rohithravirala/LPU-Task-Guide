import { Check, ChevronDown, CircleAlert } from 'lucide-react'

const controlBase =
  'w-full rounded-sm border bg-surface text-sm text-charcoal placeholder:text-stone transition-colors ' +
  'focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15 disabled:cursor-not-allowed disabled:bg-paper-deep'

function controlClass(invalid, extra = '') {
  return `${controlBase} ${invalid ? 'border-vermilion-deep' : 'border-line-strong'} ${extra}`
}

/** Label + control + hint/error. Pass the control as children. */
export function Field({ label, htmlFor, hint, error, optional = false, className = '', children }) {
  const messageId = htmlFor ? `${htmlFor}-message` : undefined
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="flex items-baseline gap-2 text-sm font-medium text-ink">
          {label}
          {optional && <span className="label-mono text-stone-deep normal-case tracking-normal">optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={messageId} className="flex items-start gap-1.5 text-[13px] text-vermilion-deep" role="alert">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-[13px] text-stone-deep">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function TextInput({ invalid, className = '', id, ...props }) {
  return (
    <input
      id={id}
      className={controlClass(invalid, `h-10 px-3 ${className}`)}
      aria-invalid={invalid || undefined}
      aria-describedby={id ? `${id}-message` : undefined}
      {...props}
    />
  )
}

export function TextArea({ invalid, className = '', id, rows = 4, ...props }) {
  return (
    <textarea
      id={id}
      rows={rows}
      className={controlClass(invalid, `px-3 py-2.5 leading-relaxed ${className}`)}
      aria-invalid={invalid || undefined}
      aria-describedby={id ? `${id}-message` : undefined}
      {...props}
    />
  )
}

export function Select({ invalid, className = '', id, children, ...props }) {
  return (
    <div className="relative">
      <select
        id={id}
        className={controlClass(invalid, `h-10 appearance-none pr-9 pl-3 ${className}`)}
        aria-invalid={invalid || undefined}
        aria-describedby={id ? `${id}-message` : undefined}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-stone-deep"
        aria-hidden="true"
      />
    </div>
  )
}

/** Square checkbox with a visible label. Works with react-hook-form's register(). */
export function Checkbox({ label, description, id, className = '', ...props }) {
  return (
    <label htmlFor={id} className={`group flex cursor-pointer items-start gap-3 ${className}`}>
      <span className="relative mt-0.5 flex size-[18px] shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          className="peer size-[18px] cursor-pointer appearance-none rounded-xs border border-line-strong bg-surface transition-colors checked:border-ink checked:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion"
          {...props}
        />
        <Check
          className="pointer-events-none absolute size-3.5 text-paper opacity-0 peer-checked:opacity-100"
          strokeWidth={3}
          aria-hidden="true"
        />
      </span>
      <span className="flex flex-col">
        <span className="text-sm text-charcoal">{label}</span>
        {description && <span className="text-[13px] text-stone-deep">{description}</span>}
      </span>
    </label>
  )
}
