const PORTALS = ['UMS', 'LPU Touch', 'LPU Live', 'Exam Office', 'Accounts', 'Help Desk', 'Department']
const TRUNK_Y = 236
const MERGE_X = 392
const STATIONS = [
  { x: 428, number: '01', label: 'Find task' },
  { x: 528, number: '02', label: 'Follow steps', current: true },
  { x: 620, number: '03', label: 'Done' },
]

/**
 * "One student, seven portals, one guided path" as a transit map:
 * seven service lines converge into the single Uni-Path line.
 */
export default function RouteMapGraphic({ className = '' }) {
  const portalY = (index) => 52 + index * 61

  return (
    <figure className={className}>
      <svg viewBox="56 4 600 430" className="h-auto w-full" role="img" aria-labelledby="route-map-title route-map-desc">
        <title id="route-map-title">Seven university services converge into one guided path</title>
        <desc id="route-map-desc">
          UMS, LPU Touch, LPU Live, the examination office, accounts, the help desk and your department are drawn as
          separate lines that merge into a single route with three stops: find the task, follow the steps, done.
        </desc>

        <text x="176" y="22" textAnchor="middle" className="fill-stone-deep font-mono text-[12px] tracking-[0.12em]">
          7 PORTALS
        </text>
        <text x="528" y={TRUNK_Y - 62} textAnchor="middle" className="fill-stone-deep font-mono text-[12px] tracking-[0.12em]">
          1 GUIDED PATH
        </text>

        {PORTALS.map((name, index) => {
          const y = portalY(index)
          const highlighted = index === 0
          return (
            <g key={name}>
              <path
                d={`M176 ${y} C 280 ${y}, 300 ${TRUNK_Y}, ${MERGE_X} ${TRUNK_Y}`}
                fill="none"
                className={highlighted ? 'stroke-ink' : 'stroke-line-strong'}
                strokeWidth={highlighted ? 3 : 2}
              />
              <text x="158" y={y + 4} textAnchor="end" className={`font-sans text-[16px] ${highlighted ? 'fill-ink font-semibold' : 'fill-charcoal'}`}>
                {name}
              </text>
              <circle cx="176" cy={y} r="6" className={highlighted ? 'fill-ink' : 'fill-surface stroke-line-strong'} strokeWidth="2" />
            </g>
          )
        })}

        <line x1={MERGE_X} y1={TRUNK_Y} x2="646" y2={TRUNK_Y} className="stroke-ink" strokeWidth="7" strokeLinecap="round" />

        {STATIONS.map((station) => (
          <g key={station.number}>
            {station.current && (
              <>
                <circle cx={station.x} cy={TRUNK_Y} r="20" className="fill-vermilion/15" />
                <rect x={station.x - 52} y={TRUNK_Y - 52} width="104" height="22" rx="2" className="fill-vermilion-deep" />
                <text x={station.x} y={TRUNK_Y - 37} textAnchor="middle" className="fill-white font-mono text-[11px] font-semibold tracking-[0.08em]">
                  YOU ARE HERE
                </text>
              </>
            )}
            <circle
              cx={station.x}
              cy={TRUNK_Y}
              r="11"
              className={station.current ? 'fill-vermilion stroke-surface' : 'fill-surface stroke-ink'}
              strokeWidth="3.5"
            />
            <text x={station.x} y={TRUNK_Y + 36} textAnchor="middle" className="fill-stone-deep font-mono text-[12px]">
              {station.number}
            </text>
            <text x={station.x} y={TRUNK_Y + 56} textAnchor="middle" className="fill-ink font-display text-[15px] font-semibold">
              {station.label}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  )
}
