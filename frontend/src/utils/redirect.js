/** Only allows internal paths like "/tasks?q=fees" (prevents open redirects via ?next=). */
export function safeRedirectPath(value, fallback = '/dashboard') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : fallback
}
