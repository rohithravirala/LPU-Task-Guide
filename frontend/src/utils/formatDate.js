import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns'

function toDate(value) {
  if (value instanceof Date) return value
  if (typeof value === 'string') return parseISO(value)
  return new Date(value)
}

/** 14 Nov 2026 */
export function formatDate(value, pattern = 'd MMM yyyy') {
  if (!value) return ''
  const date = toDate(value)
  return isValid(date) ? format(date, pattern) : ''
}

/** "just now", "5 minutes ago", "3 days ago" */
export function formatRelativeTime(value) {
  if (!value) return ''
  const date = toDate(value)
  if (!isValid(date)) return ''
  if (Date.now() - date.getTime() < 60_000) return 'just now'
  return `${formatDistanceToNowStrict(date)} ago`
}

/** 5 -> "~5 min", 90 -> "~1 h 30 min". Returns null when no estimate exists. */
export function formatDuration(minutes) {
  if (!minutes) return null
  if (minutes < 60) return `~${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `~${hours} h ${rest} min` : `~${hours} h`
}

export function greetingFor(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/** Two-digit station number: 3 -> "03" */
export function stationNumber(value) {
  return String(value).padStart(2, '0')
}
