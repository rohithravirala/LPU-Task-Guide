import { Link } from 'react-router-dom'
import lpuSeal from '../assets/lpu-seal.svg'

// LPU seal + "LPU Task Guide" wordmark, used in the top bars.
export default function Brand({ to = '/' }) {
  return (
    <Link to={to} className="flex shrink-0 items-center gap-3" aria-label="LPU Task Guide home">
      <img src={lpuSeal} alt="" width="44" height="44" className="size-10 object-contain sm:size-11" />
      <span className="h-9 w-px bg-line-strong" aria-hidden="true" />
      <span className="leading-none">
        <span className="block text-xl font-extrabold tracking-tight text-ink sm:text-[22px]">
          LPU <span className="text-flame">Task Guide</span>
        </span>
        <span className="mt-1 hidden text-[10px] font-medium tracking-[0.28em] text-muted uppercase sm:block">
          All portals · One guided path
        </span>
      </span>
    </Link>
  )
}
