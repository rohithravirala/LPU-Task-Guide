import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Wordmark } from '../components/ui/Wordmark'
import { PageLoader } from '../components/Loader'

const ROUTE = [
  { label: 'Find the task', detail: 'Search in plain words' },
  { label: 'Follow the steps', detail: 'Each mapped to the right service' },
  { label: 'Know what is next', detail: 'Your place is always marked' },
]

/** Split layout for sign-in and registration. */
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-ink p-10 text-paper lg:flex lg:flex-col">
        <Wordmark inverted />
        <div className="mt-auto max-w-md">
          <p className="label-mono text-ink-mist">One student · Seven portals · One guided path</p>
          <p className="mt-4 font-display text-[34px] leading-[1.1] font-semibold text-paper">
            Know where to go, what to bring and what comes next.
          </p>
          <ol className="mt-10">
            {ROUTE.map((stop, index) => (
              <li key={stop.label} className="relative flex gap-4 pb-6 last:pb-0">
                {index < ROUTE.length - 1 && (
                  <span aria-hidden="true" className="absolute top-7 bottom-0 left-[13px] w-0.5 bg-ink-soft" />
                )}
                <span
                  className={`num-mono relative flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    index === 1 ? 'bg-vermilion text-white' : 'border-2 border-ink-mist text-paper'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block font-medium text-paper">{stop.label}</span>
                  <span className="block text-sm text-ink-mist">{stop.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-12 text-[12px] text-ink-mist">
          A student guidance project. Not an official university service.
        </p>
      </aside>

      <main id="main" className="flex flex-col px-4 py-8 sm:px-8">
        <div className="lg:hidden">
          <Wordmark />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
