import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getVisibleSections } from '../config/navigation'
import { Wordmark } from './ui/Wordmark'

/**
 * Information navigation panel. Each section reads like a transit line: items are
 * stations on a thin rule, and the active page is the lit (vermilion) station.
 */
export default function Sidebar({ onNavigate, className = '' }) {
  const { user, logout } = useAuth()
  const sections = getVisibleSections(user)

  return (
    <aside className={`flex h-full flex-col bg-ink text-paper ${className}`} aria-label="Main navigation">
      <div className="flex h-16 shrink-0 items-center border-b border-ink-soft px-5">
        <Wordmark to="/dashboard" inverted />
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-5 py-6">
        {sections.map((section) => (
          <div key={section.id}>
            <p className="label-mono flex items-center gap-2 text-ink-mist">
              <span className="text-vermilion">{section.index}</span>
              <span aria-hidden="true" className="h-px w-4 bg-ink-soft" />
              {section.label}
            </p>
            <ul className="relative mt-3 space-y-0.5 before:absolute before:top-3 before:bottom-3 before:left-[7px] before:w-px before:bg-ink-soft">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-sm py-2 pr-2 pl-6 text-sm transition-colors ${
                        isActive ? 'bg-ink-deep font-semibold text-paper' : 'text-ink-mist hover:bg-ink-deep hover:text-paper'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          aria-hidden="true"
                          className={`absolute left-[3px] size-[9px] rounded-full border-2 transition-colors ${
                            isActive
                              ? 'border-vermilion bg-vermilion ring-3 ring-vermilion/25'
                              : 'border-ink-mist bg-ink group-hover:border-paper'
                          }`}
                        />
                        <item.icon className="size-4 shrink-0" aria-hidden="true" />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {user && (
        <div className="shrink-0 border-t border-ink-soft px-5 py-4">
          <p className="truncate text-sm font-medium text-paper">{user.name}</p>
          <p className="label-mono mt-0.5 text-ink-mist">{user.role === 'admin' ? 'Administrator' : 'Student'}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 inline-flex items-center gap-2 rounded-sm text-[13px] text-ink-mist hover:text-paper"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  )
}
