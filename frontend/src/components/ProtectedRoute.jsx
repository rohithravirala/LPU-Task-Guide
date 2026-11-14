import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from './Loader'
import { EmptyState } from './ui/StatusMessage'
import { ButtonLink } from './ui/Button'
import { safeRedirectPath } from '../utils/redirect'

/**
 * Guards signed-in pages. Guests are sent to /login with a `next` parameter so they
 * return to the page they asked for. `roles` restricts the route further.
 */
export default function ProtectedRoute({ roles, children }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader label="Checking your session" />

  if (status !== 'authenticated') {
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="This area is for administrators"
        description="Your account does not have permission to manage platform content. If you think this is a mistake, contact the platform team."
        action={
          <ButtonLink to="/dashboard" variant="secondary" size="sm">
            Back to dashboard
          </ButtonLink>
        }
      />
    )
  }

  return children ?? <Outlet />
}

/** Keeps signed-in users away from the login/register pages. */
export function GuestOnlyRoute({ children }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader label="Checking your session" />
  if (status === 'authenticated') {
    const next = new URLSearchParams(location.search).get('next')
    return <Navigate to={safeRedirectPath(next)} replace />
  }
  return children ?? <Outlet />
}
