import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { AuthDivider, AuthError, PasswordField, TextField } from '../components/AuthInput'
import { safeNextPath } from '../lib/navigation'
import { getErrorMessage, isLoggedIn, saveSession, signup } from '../services/api'

export default function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = safeNextPath(searchParams.get('next')) // page to open after signing up
  const [form, setForm] = useState({ name: '', registrationNumber: '', program: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isLoggedIn()) return <Navigate to={next} replace />

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
      navigate(next)
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute.">
      <p className="mt-4 text-sm text-fog">
        Only checking the project?{' '}
        <Link to="/login" className="font-semibold text-apricot underline underline-offset-4 hover:text-white">
          Use the demo account
        </Link>
      </p>

      <AuthError>{error}</AuthError>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <TextField id="name" name="name" label="Full name" required autoComplete="name" value={form.name} onChange={handleChange} />
        <TextField
          id="registrationNumber"
          name="registrationNumber"
          label="Registration number"
          required
          autoComplete="username"
          value={form.registrationNumber}
          onChange={handleChange}
        />
        <TextField
          id="program"
          name="program"
          label="Course"
          optional
          placeholder="e.g. B.Tech CSE"
          value={form.program}
          onChange={handleChange}
        />
        <PasswordField
          id="password"
          name="password"
          label="Create a password"
          hint="At least 8 characters. Please do not use your UMS password."
          required
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          required
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-flame text-base font-semibold text-white hover:bg-flame-deep disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
          {!loading && <ArrowRight className="size-5" aria-hidden="true" />}
        </button>
      </form>

      <AuthDivider>Already have an account?</AuthDivider>
      <Link
        to={next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-lg border border-navy-line font-semibold text-white hover:border-saffron hover:text-saffron"
      >
        Sign in
      </Link>
    </AuthLayout>
  )
}
