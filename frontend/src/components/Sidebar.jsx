import { Link, useLocation } from 'react-router-dom'
import { AppWindow, LayoutGrid, LifeBuoy } from 'lucide-react'

const links = [
  { to: '/', label: 'Tasks', icon: LayoutGrid },
  { to: '/portals', label: 'Portals', icon: AppWindow },
  { to: '/help', label: 'Help', icon: LifeBuoy },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  function isActive(to) {
    if (to === '/') return pathname === '/' || pathname.startsWith('/tasks')
    return pathname.startsWith(to)
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-black/10 bg-apricot md:sticky md:top-[72px] md:h-[calc(100vh-72px)] md:w-[104px] md:shrink-0 md:flex-col md:border-t-0"
    >
      {links.map(({ to, label, icon: Icon }) => {
        const active = isActive(to)
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[13px] font-semibold text-ink md:flex-none md:gap-2 md:border-b md:border-black/10 md:py-6 ${
              active
                ? 'bg-white/45 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-flame md:before:inset-y-0 md:before:right-auto md:before:h-auto md:before:w-1.5'
                : 'hover:bg-white/25'
            }`}
          >
            <Icon className="size-6 md:size-7" strokeWidth={1.6} aria-hidden="true" />
            {label}
          </Link>
        )
      })}

      <p className="mt-auto hidden px-3 pb-6 text-center text-[11px] leading-snug text-ink/75 md:block">
        Guide only. Work happens on the official portals.
      </p>
    </nav>
  )
}
