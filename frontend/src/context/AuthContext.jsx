import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import { onUnauthorized } from '../services/api'

const AuthContext = createContext(null)

/**
 * Holds the signed-in user. The session itself is an httpOnly cookie the browser
 * manages; this context only mirrors who the API says is signed in.
 *
 * status: 'loading' (checking the cookie) | 'authenticated' | 'unauthenticated'
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState({ status: 'loading', user: null })

  useEffect(() => {
    const controller = new AbortController()
    authService
      .getCurrentUser({ signal: controller.signal })
      .then((user) => setSession({ status: 'authenticated', user }))
      .catch(() => {
        if (!controller.signal.aborted) setSession({ status: 'unauthenticated', user: null })
      })
    return () => controller.abort()
  }, [])

  // Any API call that comes back 401 (expired session) signs the user out.
  useEffect(() => onUnauthorized(() => setSession({ status: 'unauthenticated', user: null })), [])

  const login = useCallback(async (credentials) => {
    const user = await authService.login(credentials)
    setSession({ status: 'authenticated', user })
    return user
  }, [])

  const register = useCallback(async (details) => {
    const user = await authService.register(details)
    setSession({ status: 'authenticated', user })
    return user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setSession({ status: 'unauthenticated', user: null })
    }
  }, [])

  const value = useMemo(
    () => ({
      ...session,
      isAuthenticated: session.status === 'authenticated',
      isAdmin: session.user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
