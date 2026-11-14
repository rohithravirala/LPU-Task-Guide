import {
  CircleHelp,
  FolderKanban,
  LayoutDashboard,
  LibraryBig,
  LifeBuoy,
  ListChecks,
  Megaphone,
  Plus,
  Ticket,
  TrendingUp,
  Wrench,
} from 'lucide-react'

/**
 * Sidebar information architecture, grouped like the platform's modules.
 *
 * `ready: false` items belong to modules that are still being built (see
 * docs/team-plan.md). They stay hidden until their owner registers the route in
 * routes/AppRoutes.jsx and flips the flag, so the sidebar never links to a dead page.
 */
export const NAV_SECTIONS = [
  {
    id: 'discover',
    index: '01',
    label: 'Discover',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, ready: true },
      { to: '/tasks', label: 'Task catalogue', icon: LibraryBig, ready: true },
    ],
  },
  {
    id: 'journeys',
    index: '02',
    label: 'My journeys',
    owner: 'Module 2 · Part 2',
    items: [
      { to: '/my-tasks', label: 'My tasks', icon: ListChecks, ready: false },
      { to: '/progress', label: 'Progress', icon: TrendingUp, ready: false },
    ],
  },
  {
    id: 'help',
    index: '03',
    label: 'Help',
    owner: 'Module 3',
    items: [
      { to: '/help', label: 'Help centre', icon: LifeBuoy, ready: false },
      { to: '/help/faqs', label: 'FAQs', icon: CircleHelp, ready: false },
      { to: '/help/troubleshooting', label: 'Troubleshooting', icon: Wrench, ready: false },
      { to: '/notices', label: 'Notices', icon: Megaphone, ready: false },
      { to: '/support', label: 'Support tickets', icon: Ticket, ready: false },
    ],
  },
  {
    id: 'admin',
    index: 'A',
    label: 'Administration',
    roles: ['admin'],
    items: [
      { to: '/admin/tasks', label: 'Manage tasks', icon: FolderKanban, ready: true, end: true },
      { to: '/admin/tasks/new', label: 'New task', icon: Plus, ready: true },
    ],
  },
]

export function getVisibleSections(user) {
  return NAV_SECTIONS.filter((section) => !section.roles || section.roles.includes(user?.role))
    .map((section) => ({ ...section, items: section.items.filter((item) => item.ready) }))
    .filter((section) => section.items.length > 0)
}
