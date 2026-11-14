import { SERVICE_TYPES } from '../../utils/serviceTypes'

export function ServiceTypeIcon({ type, className = 'size-4' }) {
  const Icon = (SERVICE_TYPES[type] ?? SERVICE_TYPES.other).icon
  return <Icon className={className} aria-hidden="true" />
}
