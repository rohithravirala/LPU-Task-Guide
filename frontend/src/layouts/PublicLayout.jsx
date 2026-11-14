import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { PublicNavbar, SkipLink } from '../components/Navbar'
import Footer from '../components/Footer'
import { PageLoader } from '../components/Loader'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SkipLink />
      <PublicNavbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
