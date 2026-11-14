import { NavLink } from 'react-router-dom'
import { LifeBuoy, ListChecks } from 'lucide-react'
import logo from '../assets/logo.svg'

const links = [
  { to: '/', label: 'All tasks', icon: ListChecks },
  { to: '/help', label: 'Help & FAQs', icon: LifeBuoy },
]

// Main navigation. A left panel on laptops, a top bar on phones.
export default function Sidebar() {
  return (
    <aside className="flex items-center bg-ink text-paper md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:flex-col md:items-stretch">
      <div className="flex items-center gap-3 px-4 py-3 md:px-5 md:py-6">
        <img src={logo} alt="" className="size-8" />
        <span className="text-lg font-bold">LPU-Uni-Path</span>
      </div>

      <nav className="ml-auto flex gap-1 px-2 md:ml-0 md:flex-col md:px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] ${
                isActive ? 'bg-ink-soft font-semibold text-paper' : 'text-ink-mist hover:bg-ink-soft hover:text-paper'
              }`
            }
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <p className="mt-auto hidden p-5 text-sm leading-relaxed text-ink-mist md:block">
        One university. Many portals. One simple guide.
      </p>
    </aside>
  )
}
