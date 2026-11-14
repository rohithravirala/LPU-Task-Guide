import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { AppNavbar, SkipLink } from '../components/Navbar'
import { PageLoader } from '../components/Loader'

/** Signed-in shell: fixed sidebar on desktop, drawer on smaller screens. */
export default function StudentLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!drawerOpen) return undefined
    const onKeyDown = (event) => event.key === 'Escape' && setDrawerOpen(false)
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [drawerOpen])

  return (
    <div className="min-h-screen bg-paper lg:pl-64">
      <SkipLink />
      <Sidebar className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:flex" />

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/50"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] shadow-float">
            <Sidebar className="w-full" onNavigate={() => setDrawerOpen(false)} />
            <button
              type="button"
              autoFocus
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-3 rounded-sm p-1.5 text-ink-mist hover:bg-ink-deep hover:text-paper"
              aria-label="Close navigation"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <AppNavbar onMenuClick={() => setDrawerOpen(true)} />

      <main id="main" tabIndex={-1} className="px-4 pt-6 pb-24 outline-none sm:px-6 lg:px-10 lg:pt-8 lg:pb-12">
        <div className="mx-auto max-w-[76rem]">
          <Suspense fallback={<PageLoader />}>
            <Outlet key={location.pathname} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
