import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, KeyRound } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { AuthDivider, AuthError, PasswordField, TextField } from '../components/AuthInput'
import { DEMO_ACCOUNT } from '../lib/demo'
import { safeNextPath } from '../lib/navigation'
import { getErrorMessage, isLoggedIn, login, saveSession } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = safeNextPath(searchParams.get('next')) // page to open after signing in
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in? Go straight on.
  if (isLoggedIn()) return <Navigate to={next} replace />

  function fillDemoAccount() {
    setRegistrationNumber(DEMO_ACCOUNT.registrationNumber)
    setPassword(DEMO_ACCOUNT.password)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    setError('')
    setLoading(true)
    try {
      const data = await login(registrationNumber, password)
      saveSession(data) // keep the token + student details in the browser
      navigate(next)
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={next === '/' ? 'Sign in to see every task from every LPU portal.' : 'Sign in to see the steps for this task.'}
    >
      {/* Demo account for teachers / evaluators */}
      <div className="mt-8 rounded-xl border border-saffron/40 bg-saffron/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-apricot">
          <KeyRound className="size-4" aria-hidden="true" /> Demo account for evaluation
        </p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-sm">
          <dt className="text-fog">Registration no.</dt>
          <dd className="font-mono font-semibold text-white">{DEMO_ACCOUNT.registrationNumber}</dd>
          <dt className="text-fog">Password</dt>
          <dd className="font-mono font-semibold text-white">{DEMO_ACCOUNT.password}</dd>
        </dl>
        <button type="button" onClick={fillDemoAccount} className="mt-3 text-sm font-semibold text-apricot underline underline-offset-4 hover:text-white">
          Fill in the demo login
        </button>
      </div>

      <AuthError>{error}</AuthError>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <TextField
          id="registrationNumber"
          label="Registration number"
          placeholder="Enter your registration number"
          required
          autoComplete="username"
          value={registrationNumber}
          onChange={(event) => setRegistrationNumber(event.target.value)}
        />
        <PasswordField
          id="password"
          label="Password"
          placeholder="Your LPU Task Guide password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-flame text-base font-semibold text-white hover:bg-flame-deep disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading && <ArrowRight className="size-5" aria-hidden="true" />}
        </button>
      </form>

      <AuthDivider>New here?</AuthDivider>
      <Link
        to={next === '/' ? '/signup' : `/signup?next=${encodeURIComponent(next)}`}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-lg border border-navy-line font-semibold text-white hover:border-saffron hover:text-saffron"
      >
        Create an account
      </Link>

      <p className="mt-8 text-center text-sm text-fog">
        This is not your UMS login. Use the password you created for LPU Task Guide.
      </p>
    </AuthLayout>
  )
}
