import { LifeBuoy } from 'lucide-react'

// Each portal gets its own colour, so students can tell at a glance where a task happens.
const colours = {
  ums: 'bg-flame-wash text-flame-deep ring-flame/15',
  'lpu-live': 'bg-navy text-apricot ring-navy',
  codetantra: 'bg-blue-wash text-blue-deep ring-blue/15',
  neocolab: 'bg-violet-wash text-violet ring-violet/15',
  'lpu-touch': 'bg-teal-wash text-teal ring-teal/15',
}

const sizes = {
  sm: 'size-9 rounded-lg text-[10px]',
  md: 'size-11 rounded-xl text-[11px]',
  lg: 'size-14 rounded-2xl text-[13px]',
}
// Long names like "Touch" need smaller letters to fit the square
const longNameSizes = {
  sm: 'size-9 rounded-lg text-[8px] tracking-normal',
  md: 'size-11 rounded-xl text-[9.5px] tracking-normal',
  lg: 'size-14 rounded-2xl text-[11.5px] tracking-normal',
}

// Small square badge with the portal's short name ("UMS", "Live", "CT" ...).
// Tasks without a portal (e.g. the help desk) get a help icon instead.
export default function PortalMark({ portal, size = 'md' }) {
  const sizeClass = (portal?.shortName?.length ?? 0) > 4 ? longNameSizes[size] : `${sizes[size]} tracking-wide`
  const base = `flex shrink-0 items-center justify-center font-bold uppercase ring-1 ring-inset ${sizeClass}`

  if (!portal) {
    return (
      <span aria-hidden="true" className={`${base} bg-paper text-muted ring-line`}>
        <LifeBuoy className="size-1/2" />
      </span>
    )
  }

  return (
    <span aria-hidden="true" className={`${base} ${colours[portal.slug] ?? 'bg-paper text-ink ring-line'}`}>
      {portal.shortName}
    </span>
  )
}
