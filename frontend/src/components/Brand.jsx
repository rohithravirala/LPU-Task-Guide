import { Link } from 'react-router-dom'
import lpuSeal from '../assets/lpu-seal.svg'

export default function Brand({ to = '/' }) {
  return (
    <Link to={to} className="flex shrink-0 items-center gap-3" aria-label="LPU Task Guide home">
      <img src={lpuSeal} alt="" width="44" height="44" className="size-10 object-contain sm:size-11" />
      <span className="h-9 w-px bg-line-strong" aria-hidden="true" />
      <span className="font-brand leading-none">
        <span className="block text-[19px] font-extrabold tracking-[-0.01em] text-ink sm:text-[21px]">
          LPU <span className="text-flame">Task Guide</span>
        </span>
        <span className="mt-1.5 hidden text-[9.5px] font-semibold tracking-[0.22em] text-charcoal/75 uppercase sm:block">
          All portals <span className="text-flame">•</span> One guided path
        </span>
      </span>
    </Link>
  )
}
