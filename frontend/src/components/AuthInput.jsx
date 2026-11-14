import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Dark form fields for the Sign in page (styled like LPU Live).
const inputClass =
  'h-12 w-full rounded-lg border border-navy-line bg-navy-soft px-4 text-base text-white placeholder:text-fog/70 focus:border-flame focus:ring-2 focus:ring-flame/30 focus:outline-none'

function Label({ htmlFor, label, optional }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-white">
      {label}
      {optional && <span className="font-normal text-fog"> (optional)</span>}
    </label>
  )
}

export function TextField({ id, label, hint, optional = false, ...inputProps }) {
  return (
    <div>
      <Label htmlFor={id} label={label} optional={optional} />
      <input id={id} aria-describedby={hint ? `${id}-hint` : undefined} className={`mt-2 ${inputClass}`} {...inputProps} />
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-fog">
          {hint}
        </p>
      )}
    </div>
  )
}

// Password input with a show / hide button (the eye icon, like on LPU Live)
export function PasswordField({ id, label, hint, ...inputProps }) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <Label htmlFor={id} label={label} />
      <div className="relative mt-2">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`${inputClass} pr-12`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-fog hover:text-white"
        >
          {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-fog">
          {hint}
        </p>
      )}
    </div>
  )
}

// Error message shown above the form
export function AuthError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="mt-6 rounded-lg border border-danger/50 bg-danger/15 px-4 py-3 text-sm text-danger-light">
      {children}
    </p>
  )
}
