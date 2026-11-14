import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { buttonClasses } from './buttonStyles'

function ButtonContent({ loading, icon: Icon, iconRight: IconRight, children }) {
  return (
    <>
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && <IconRight className="size-4 shrink-0" aria-hidden="true" />}
    </>
  )
}

export function Button({
  variant,
  size,
  loading = false,
  icon,
  iconRight,
  className,
  type = 'button',
  disabled,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <ButtonContent loading={loading} icon={icon} iconRight={iconRight}>
        {children}
      </ButtonContent>
    </button>
  )
}

/** A react-router link styled as a button. */
export function ButtonLink({ to, variant, size, icon, iconRight, className, children, ...props }) {
  return (
    <Link to={to} className={buttonClasses({ variant, size, className })} {...props}>
      <ButtonContent icon={icon} iconRight={iconRight}>
        {children}
      </ButtonContent>
    </Link>
  )
}
