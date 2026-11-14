import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Field, TextInput } from '../components/ui/Field'
import { Notice } from '../components/ui/StatusMessage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { safeRedirectPath } from '../utils/redirect'

export default function LoginPage() {
  useDocumentTitle('Sign in')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState(null)
  const next = safeRedirectPath(searchParams.get('next'))

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } })

  const onSubmit = async (values) => {
    setFormError(null)
    try {
      await login(values)
      navigate(next, { replace: true })
    } catch (error) {
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, message]) => setError(field, { message }))
      }
      setFormError(error.message)
    }
  }

  return (
    <div>
      <p className="label-mono text-stone-deep">Welcome back</p>
      <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-[15px] text-stone-deep">Continue to your tasks and guided journeys.</p>

      {formError && (
        <Notice tone="warning" className="mt-6">
          {formError}
        </Notice>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            invalid={Boolean(errors.email)}
            {...register('email', { required: 'Email is required' })}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <TextInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="pr-11"
              invalid={Boolean(errors.password)}
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-sm p-1.5 text-stone-deep hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} icon={LogIn}>
          Sign in
        </Button>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-sm text-stone-deep">
        New to LPU-Uni-Path?{' '}
        <Link
          to={`/register${next !== '/dashboard' ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="font-medium text-ink underline underline-offset-4 hover:text-vermilion-deep"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}
