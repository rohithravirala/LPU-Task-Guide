import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { getErrorMessage, isLoggedIn, login, saveSession } from '../services/api'

const inputClass =
  'mt-1.5 h-12 w-full rounded-lg border border-line-strong bg-surface px-4 text-base focus:border-ink focus:outline-none'

export default function Login() {
  const navigate = useNavigate()
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in? Go straight to the tasks.
  if (isLoggedIn()) return <Navigate to="/" replace />

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    setError('')
    setLoading(true)
    try {
      const data = await login(registrationNumber, password)
      saveSession(data) // keep the token + student details in the browser
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold">Sign in</h2>
      <p className="mt-2 text-stone-deep">Welcome back! Sign in to see your tasks.</p>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-vermilion-wash px-4 py-3 text-sm text-vermilion-deep">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="registrationNumber" className="text-sm font-semibold text-ink">
            Registration number
          </label>
          <input
            id="registrationNumber"
            required
            autoComplete="username"
            value={registrationNumber}
            onChange={(event) => setRegistrationNumber(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-semibold text-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-lg bg-ink text-base font-semibold text-paper hover:bg-ink-deep disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-stone-deep">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
      <p className="mt-8 text-center text-xs text-stone-deep">
        This is not your UMS login. Use the password you created for LPU-Uni-Path.
      </p>
    </AuthLayout>
  )
}
