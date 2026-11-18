import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, FlaskConical } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { AuthError, PasswordField, TextField } from '../components/AuthInput'
import { safeNextPath } from '../lib/navigation'
import { getErrorMessage, isLoggedIn, login, loginAsDemo, saveSession } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = safeNextPath(searchParams.get('next'))
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  if (isLoggedIn()) return <Navigate to={next} replace />

  async function signIn(kind, request) {
    setError('')
    setBusy(kind)
    try {
      saveSession(await request())
      navigate(next)
    } catch (err) {
      setError(getErrorMessage(err))
      setBusy('')
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    signIn('password', () => login(registrationNumber, password))
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={next === '/' ? 'Sign in to LPU Task Guide.' : 'Sign in to see the steps for this task.'}
    >
      <AuthError>{error}</AuthError>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={Boolean(busy)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-flame text-base font-semibold text-white hover:bg-flame-deep disabled:opacity-60"
          >
            {busy === 'password' ? 'Signing in…' : 'Sign in'}
            {busy !== 'password' && <ArrowRight className="size-5" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => signIn('demo', loginAsDemo)}
            disabled={Boolean(busy)}
            aria-describedby="try-demo-hint"
            className="flex h-12 items-center justify-center gap-2 rounded-lg border border-saffron/60 px-4 text-base font-semibold text-apricot hover:border-apricot hover:bg-saffron/10 disabled:opacity-60 sm:px-5"
          >
            <FlaskConical className="size-5" aria-hidden="true" />
            {busy === 'demo' ? 'Opening…' : 'Try demo'}
          </button>
        </div>
        <p id="try-demo-hint" className="-mt-2 text-sm text-fog">
          <span className="font-semibold text-apricot">Try demo</span> opens a test account with sample data, no login needed.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-fog">
        This is not your UMS login. Use the LPU Task Guide login you were given.
      </p>
    </AuthLayout>
  )
}
