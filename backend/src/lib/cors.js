/**
 * CORS configuration shared by `src/proxy.js` (preflight + response headers) and
 * `lib/apiHandler.js` (rejects state-changing requests from unknown origins).
 */
const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

export function getAllowedOrigins() {
  const raw = process.env.CLIENT_ORIGINS;
  if (!raw) return DEFAULT_ORIGINS;
  return raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export function isAllowedOrigin(origin) {
  return Boolean(origin) && getAllowedOrigins().includes(origin);
}

export function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '600',
  };
}
