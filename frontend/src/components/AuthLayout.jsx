import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import lpuSeal from '../assets/lpu-seal.svg'
import PortalMark from './PortalMark'
import { getTasks } from '../services/api'

// Shown until the real numbers arrive (or if the server cannot be reached)
const fallbackPortals = [
  { slug: 'ums', shortName: 'UMS', name: 'UMS' },
  { slug: 'lpu-live', shortName: 'Live', name: 'LPU Live' },
  { slug: 'codetantra', shortName: 'CT', name: 'CodeTantra' },
  { slug: 'neocolab', shortName: 'Neo', name: 'NeoColab' },
  { slug: 'lpu-touch', shortName: 'Touch', name: 'LPU Touch' },
]

// What is inside the app, from the public task list: each portal, how many tasks it
// has and two example tasks. Lets visitors see the tasks before they sign up.
function useTaskOverview() {
  const [overview, setOverview] = useState({ total: 0, portals: fallbackPortals.map((portal) => ({ ...portal, count: 0, examples: [] })) })

  useEffect(() => {
    let ignore = false
    getTasks()
      .then(({ tasks, portals }) => {
        if (ignore) return
        setOverview({
          total: tasks.length,
          portals: portals.map((portal) => {
            const own = tasks.filter((task) => task.portal?.slug === portal.slug)
            // Popular tasks first, so the examples are the ones students know
            const examples = [...own].sort((a, b) => Number(b.isPopular) - Number(a.isPopular)).slice(0, 2)
            return { ...portal, count: own.length, examples: examples.map((task) => task.title) }
          }),
        })
      })
      .catch(() => {}) // keep the fallback list
    return () => {
      ignore = true
    }
  }, [])

  return overview
}

// Shared layout for the Sign in and Sign up pages, in the style of the LPU Live sign-in page:
// one big rounded card, warm dark gradient on the left, the form on a black panel on the right.
export default function AuthLayout({ title, subtitle, children }) {
  const { total, portals } = useTaskOverview()

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy sm:p-6 lg:p-10">
      <div className="grid min-h-screen w-full max-w-6xl overflow-hidden bg-night sm:min-h-[min(820px,calc(100vh-3rem))] sm:rounded-[28px] sm:shadow-2xl sm:shadow-black/40 lg:grid-cols-[1.08fr_1fr]">
        {/* Left side: what is inside the app (hidden on phones) */}
        <section
          className="relative hidden flex-col justify-between gap-8 p-10 lg:flex xl:p-12"
          style={{ background: 'linear-gradient(165deg, var(--color-ember-deep) 8%, #2f1107 55%, var(--color-ember) 100%)' }}
        >
          <div className="flex items-center gap-3.5">
            <img src={lpuSeal} alt="Lovely Professional University" width="56" height="56" className="size-14 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-white">LPU TASK GUIDE</span>
          </div>

          <div className="mx-auto w-full max-w-md">
            <p className="text-xs font-semibold tracking-[0.2em] text-apricot uppercase">What’s inside · no sign-in needed</p>
            <h2 className="mt-2 text-[28px] leading-tight font-bold text-white">
              {total ? `${total} LPU tasks` : 'Every LPU task'} from 5 portals
            </h2>
            <ul className="mt-5 space-y-2">
              {portals.map((portal) => (
                <li key={portal.slug} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
                  <PortalMark portal={portal} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{portal.name}</span>
                    {portal.examples.length > 0 && (
                      <span className="block truncate text-xs text-white/60">{portal.examples.join(' · ')}</span>
                    )}
                  </span>
                  {portal.count > 0 && <span className="shrink-0 text-sm font-semibold text-apricot">{portal.count} tasks</span>}
                </li>
              ))}
            </ul>
            <Link
              to="/explore"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg border border-white/25 px-4 font-semibold text-white hover:border-apricot hover:text-apricot"
            >
              Browse all tasks <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div>
            <p className="font-serif text-[24px] leading-snug text-white italic">“One university. Many portals. One guided path.”</p>
            <p className="mt-5 text-sm text-white/60">A student guidance project. Not an official LPU website.</p>
          </div>
        </section>

        {/* Right side: the form */}
        <main className="flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <img src={lpuSeal} alt="Lovely Professional University" width="44" height="44" className="size-11 object-contain" />
              <span className="text-xl font-bold tracking-tight text-white">LPU TASK GUIDE</span>
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-[44px]">{title}</h1>
            <p className="mt-3 text-lg text-fog">{subtitle}</p>
            {children}

            {/* Phones do not see the left side, so link the task list here */}
            <Link to="/explore" className="mt-8 flex items-center justify-center gap-1.5 text-sm font-semibold text-apricot hover:underline lg:hidden">
              Just looking? Browse {total || 'all'} tasks without signing in <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
