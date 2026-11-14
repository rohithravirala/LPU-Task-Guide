import { NextResponse } from 'next/server';
import { corsHeaders, isAllowedOrigin } from './lib/cors.js';

/**
 * Next.js 16 "proxy" (formerly middleware). Runs before every /api request.
 * Responsibilities: answer CORS preflight requests and attach CORS headers for the
 * allow-listed frontend origins (CLIENT_ORIGINS). Authentication is NOT done here;
 * each route declares its own access level through `apiHandler`.
 */
export function proxy(request) {
  const origin = request.headers.get('origin');
  const allowed = isAllowedOrigin(origin);

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: { ...(allowed ? corsHeaders(origin) : {}), Vary: 'Origin' },
    });
  }

  const response = NextResponse.next();
  response.headers.append('Vary', 'Origin');
  if (allowed) {
    for (const [key, value] of Object.entries(corsHeaders(origin))) {
      response.headers.set(key, value);
    }
  }
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
