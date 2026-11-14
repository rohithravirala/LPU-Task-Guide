import logo from '../assets/logo.svg'

const howItWorks = [
  'Search for what you want to do, like "pay exam fine"',
  'Follow the steps one by one',
  'See exactly where to go: UMS, an app, or an office',
]

// Shared layout for the Sign in and Sign up pages.
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side: what the app does (hidden on phones) */}
      <section className="hidden flex-col justify-between bg-ink p-12 text-paper lg:flex">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="size-9" />
          <span className="text-xl font-bold">LPU-Uni-Path</span>
        </div>

        <div>
          <h1 className="max-w-md text-4xl font-bold text-paper">University tasks, made simple.</h1>
          <p className="mt-4 max-w-md text-lg text-ink-mist">
            Not sure where to go or what to do? We show you, step by step.
          </p>
          <ol className="mt-10 space-y-5">
            {howItWorks.map((text, index) => (
              <li key={text} className="flex items-center gap-4 text-lg">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-paper font-bold text-ink">
                  {index + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
        </div>

        <p className="text-sm text-ink-mist">A student guidance project. Not an official university website.</p>
      </section>

      {/* Right side: the form */}
      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src={logo} alt="" className="size-9" />
            <span className="text-xl font-bold text-ink">LPU-Uni-Path</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
