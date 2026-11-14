// Where to go after signing in. The public task list sends visitors to
// /login?next=/tasks/<id>, so they land on the task they clicked.
// Only our own pages are allowed ("/..."), never another website ("//evil.com").
export function safeNextPath(next) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/'
}
