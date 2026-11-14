import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { AuthError, PasswordField, TextField } from '../components/AuthInput'
import { safeNextPath } from '../lib/navigation'
import { getErrorMessage, isLoggedIn, login, saveSession } from '../services/api'

// Sign in. There is no sign-up: accounts are given out by the project team.
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
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-flame text-base font-semibold text-white hover:bg-flame-deep disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading && <ArrowRight className="size-5" aria-hidden="true" />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-fog">
        This is not your UMS login. Use the LPU Task Guide login you were given.
      </p>
    </AuthLayout>
  )
}
