export function safeNextPath(next) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/'
}
