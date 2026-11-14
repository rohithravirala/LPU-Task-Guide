import { Link } from 'react-router-dom'
import { Wordmark } from './ui/Wordmark'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper-deep">
      <div className="mx-auto grid max-w-[76rem] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-10">
        <div>
          <Wordmark />
          <p className="mt-3 font-display text-lg font-medium text-ink">
            One University. Multiple Portals. One Guided Path.
          </p>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-stone-deep">
            LPU-Uni-Path is a student guidance layer. It is not an official university service and does not replace UMS,
            LPU Touch, LPU Live or any department. Guidance marked “Unverified” is illustrative: always confirm details
            with official university sources.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-6 text-sm md:justify-self-end">
          <div>
            <p className="label-mono text-stone-deep">Platform</p>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#how-it-works" className="text-charcoal hover:text-ink hover:underline">
                  How it works
                </a>
              </li>
              <li>
                <a href="#catalogue" className="text-charcoal hover:text-ink hover:underline">
                  Task catalogue
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="label-mono text-stone-deep">Account</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/login" className="text-charcoal hover:text-ink hover:underline">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-charcoal hover:text-ink hover:underline">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </footer>
  )
}
