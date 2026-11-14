const VARIANTS = {
  primary: 'border-ink bg-ink text-paper hover:border-ink-deep hover:bg-ink-deep',
  accent: 'border-vermilion-deep bg-vermilion-deep text-white hover:border-vermilion-dark hover:bg-vermilion-dark',
  secondary: 'border-line-strong bg-surface text-ink hover:border-ink hover:bg-paper-deep',
  ghost: 'border-transparent bg-transparent text-ink hover:bg-paper-deep',
  danger: 'border-vermilion-deep/50 bg-surface text-vermilion-deep hover:border-vermilion-deep hover:bg-vermilion-wash',
  dangerSolid: 'border-vermilion-deep bg-vermilion-deep text-white hover:border-vermilion-dark hover:bg-vermilion-dark',
  onInk: 'border-ink-soft bg-transparent text-paper hover:border-ink-mist hover:bg-ink-deep',
}

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-5 text-[15px]',
  icon: 'h-10 w-10 justify-center',
}

/** Class list for anything that should look like a button (buttons, links, anchors). */
export function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return [
    'inline-flex items-center justify-center rounded-sm border font-medium whitespace-nowrap',
    'transition-colors duration-150 select-none',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  ].join(' ')
}
