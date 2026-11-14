import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Field, TextInput } from '../components/ui/Field'
import { Notice } from '../components/ui/StatusMessage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { safeRedirectPath } from '../utils/redirect'

export default function RegisterPage() {
  useDocumentTitle('Create account')
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState(null)
  const next = safeRedirectPath(searchParams.get('next'))

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: '', email: '', registrationNumber: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async ({ name, email, registrationNumber, password }) => {
    setFormError(null)
    try {
      await createAccount({ name, email, registrationNumber, password })
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
      <p className="label-mono text-stone-deep">New here</p>
      <h1 className="mt-2 text-3xl font-semibold">Create your account</h1>
      <p className="mt-2 text-[15px] text-stone-deep">
        Save your journeys and pick up exactly where you left off.
      </p>

      {formError && (
        <Notice tone="warning" className="mt-6">
          {formError}
        </Notice>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <TextInput
            id="name"
            autoComplete="name"
            invalid={Boolean(errors.name)}
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />
        </Field>

        <Field label="University email" htmlFor="email" error={errors.email?.message}>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            invalid={Boolean(errors.email)}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
          />
        </Field>

        <Field
          label="Registration number"
          htmlFor="registrationNumber"
          optional
          hint="Helps support staff find your record if you raise a ticket."
          error={errors.registrationNumber?.message}
        >
          <TextInput
            id="registrationNumber"
            className="num-mono uppercase"
            invalid={Boolean(errors.registrationNumber)}
            {...register('registrationNumber', {
              pattern: { value: /^[A-Za-z0-9-]*$/, message: 'Use letters, numbers or hyphens only' },
              maxLength: { value: 20, message: 'Registration number must be 20 characters or fewer' },
            })}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password" htmlFor="password" hint="At least 8 characters." error={errors.password?.message}>
            <TextInput
              id="password"
              type="password"
              autoComplete="new-password"
              invalid={Boolean(errors.password)}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Use at least 8 characters' },
                maxLength: { value: 72, message: 'Use 72 characters or fewer' },
              })}
            />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
            <TextInput
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === getValues('password') || 'Passwords do not match',
              })}
            />
          </Field>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting} icon={UserRound}>
          Create account
        </Button>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-sm text-stone-deep">
        Already have an account?{' '}
        <Link
          to={`/login${next !== '/dashboard' ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="font-medium text-ink underline underline-offset-4 hover:text-vermilion-deep"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
