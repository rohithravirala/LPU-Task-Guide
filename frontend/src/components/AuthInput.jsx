import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const inputClass =
  'h-12 w-full rounded-lg border border-navy-line bg-navy-soft px-4 text-base text-white placeholder:text-fog/70 focus:border-flame focus:ring-2 focus:ring-flame/30 focus:outline-none'

export function TextField({ id, label, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <input id={id} className={`mt-2 ${inputClass}`} {...inputProps} />
    </div>
  )
}

export function PasswordField({ id, label, ...inputProps }) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <div className="relative mt-2">
        <input id={id} type={visible ? 'text' : 'password'} className={`${inputClass} pr-12`} {...inputProps} />
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
    </div>
  )
}

export function AuthError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="mt-6 rounded-lg border border-danger/50 bg-danger/15 px-4 py-3 text-sm text-danger-light">
      {children}
    </p>
  )
}
