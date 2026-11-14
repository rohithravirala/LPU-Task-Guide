import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Wordmark } from './ui/Wordmark'
import { ButtonLink } from './ui/Button'
import TaskSearch from '../modules/taskCatalogue/components/TaskSearch'

function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !menuRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-sm py-1 pr-1 pl-1 hover:bg-paper-deep"
      >
        <span className="num-mono flex size-8 items-center justify-center rounded-sm bg-ink text-[12px] font-semibold text-paper">
          {initialsOf(user.name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-36 truncate text-sm leading-tight font-medium text-ink">{user.name}</span>
          <span className="label-mono block text-[10px] text-stone-deep">{user.role === 'admin' ? 'Admin' : 'Student'}</span>
        </span>
        <ChevronDown className="size-4 text-stone-deep" aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-64 rounded-sm border border-line bg-surface p-2 shadow-float">
          <div className="border-b border-line px-3 pt-2 pb-3">
            <p className="text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-[13px] text-stone">{user.email}</p>
            {user.registrationNumber && <p className="num-mono mt-1 text-[12px] text-stone">{user.registrationNumber}</p>}
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="mt-1 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-charcoal hover:bg-paper-deep"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

/** Top bar inside the signed-in app: menu button (mobile), global task search, user menu. */
export function AppNavbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-1 rounded-sm p-2 text-ink hover:bg-paper-deep lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <div className="lg:hidden">
          <Wordmark to="/dashboard" />
        </div>
        <div className="hidden flex-1 md:block md:max-w-xl">
          <TaskSearch variant="compact" />
        </div>
        <div className="ml-auto">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

/** Header for public pages (landing). */
export function PublicNavbar() {
  const { isAuthenticated } = useAuth()
  const linkClass = 'rounded-sm px-2 py-1 text-sm text-charcoal hover:text-ink hover:underline underline-offset-4'

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-[76rem] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Wordmark />
        <nav className="ml-auto hidden items-center gap-4 md:flex" aria-label="Page sections">
          <a href="#how-it-works" className={linkClass}>
            How it works
          </a>
          <a href="#catalogue" className={linkClass}>
            Task catalogue
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-4">
          {isAuthenticated ? (
            <ButtonLink to="/dashboard" size="sm">
              Open dashboard
            </ButtonLink>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Sign in
              </NavLink>
              <ButtonLink to="/register" size="sm">
                Create account
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-sm bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to content
    </a>
  )
}
