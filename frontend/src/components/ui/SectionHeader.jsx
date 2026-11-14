/**
 * Editorial section heading: mono index ("01") + eyebrow + title, with an optional
 * description and a right-aligned action.
 */
export function SectionHeader({ index, eyebrow, title, description, action, as: Heading = 'h2', className = '' }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-3 ${className}`}>
      <div className="min-w-0">
        {(index || eyebrow) && (
          <p className="label-mono flex items-center gap-2 text-stone-deep">
            {index && <span className="text-vermilion-deep">{index}</span>}
            {index && eyebrow && <span aria-hidden="true" className="h-px w-5 bg-line-strong" />}
            {eyebrow}
          </p>
        )}
        <Heading className={`${index || eyebrow ? 'mt-1.5' : ''} text-xl font-semibold sm:text-[22px]`}>{title}</Heading>
        {description && <p className="mt-1 max-w-2xl text-sm text-stone-deep">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/** Large page title used at the top of each page. */
export function PageHeader({ eyebrow, title, description, actions, children }) {
  return (
    <header className="border-b border-line pb-6">
      {eyebrow && <p className="label-mono text-stone-deep">{eyebrow}</p>}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <h1 className="text-[28px] leading-tight font-semibold sm:text-[34px]">{title}</h1>
          {description && <p className="mt-2 text-[15px] leading-relaxed text-stone-deep">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
      </div>
      {children}
    </header>
  )
}
