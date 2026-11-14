import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { getErrorMessage, isLoggedIn, saveSession, signup } from '../services/api'

const inputClass =
  'mt-1.5 h-12 w-full rounded-lg border border-line-strong bg-surface px-4 text-base focus:border-ink focus:outline-none'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', registrationNumber: '', program: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isLoggedIn()) return <Navigate to="/" replace />

  // One change handler for every input: uses the input's `name` to update the right field
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    // Quick checks in the browser (the backend checks again)
    if (form.password.length < 8) return setError('Password must be at least 8 characters')
    if (form.password !== form.confirmPassword) return setError('The two passwords do not match')

    setLoading(true)
    try {
      const data = await signup(form)
      saveSession(data) // signed up = logged in
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold">Create your account</h2>
      <p className="mt-2 text-stone-deep">It takes less than a minute.</p>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-vermilion-wash px-4 py-3 text-sm text-vermilion-deep">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-ink">Full name</label>
          <input id="name" name="name" required autoComplete="name" value={form.name} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="registrationNumber" className="text-sm font-semibold text-ink">Registration number</label>
          <input
            id="registrationNumber"
            name="registrationNumber"
            required
            autoComplete="username"
            value={form.registrationNumber}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="program" className="text-sm font-semibold text-ink">
            Course <span className="font-normal text-stone-deep">(optional)</span>
          </label>
          <input id="program" name="program" placeholder="e.g. B.Tech CSE" value={form.program} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-semibold text-ink">Create a password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            className={inputClass}
          />
          <p className="mt-1.5 text-sm text-stone-deep">At least 8 characters. Please do not use your UMS password.</p>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-ink">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-lg bg-ink text-base font-semibold text-paper hover:bg-ink-deep disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-stone-deep">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
