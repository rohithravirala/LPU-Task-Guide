import { connection } from 'next/server';
import { connectDB, describeDatabaseError, isDatabaseConnectionError } from './mongodb.js';
import { isAllowedOrigin } from './cors.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { ApiError } from '../utils/apiError.js';
import { sendError } from '../utils/apiResponse.js';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Wraps a controller so every route behaves the same way:
 *   - always runs at request time (Cache Components is enabled in next.config)
 *   - connects to MongoDB
 *   - resolves the signed-in user and enforces the declared access level
 *   - converts thrown errors into the standard JSON error envelope
 *
 * Usage in a route.js file:
 *   export const GET  = apiHandler(controller.list, { auth: 'optional' });
 *   export const POST = apiHandler(controller.create, { roles: ['admin'] });
 *
 * @param {(ctx: { request: Request, params: object, user: object|null }) => Promise<Response>} controller
 * @param {{ auth?: 'none'|'optional'|'required', roles?: string[] }} [options]
 */
export function apiHandler(controller, { auth = 'none', roles } = {}) {
  const requiresUser = auth === 'required' || Boolean(roles?.length);
  const loadsUser = requiresUser || auth === 'optional';

  return async function routeHandler(request, context) {
    // Must stay outside try/catch: during `next build` this throws an internal signal
    // that tells Next.js to stop prerendering. Catching it would break the build.
    await connection();

    try {
      rejectUnknownOrigins(request);
      await connectDB();

      const params = context?.params ? await context.params : {};
      const user = loadsUser ? await authenticate(request) : null;

      if (requiresUser && !user) throw ApiError.unauthorized();
      if (roles?.length && !roles.includes(user.role)) throw ApiError.forbidden();

      return await controller({ request, params, user });
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * CSRF guard: browsers always send an Origin header on cross-origin state-changing
 * requests. Requests without an Origin (curl, server-to-server) are allowed.
 */
function rejectUnknownOrigins(request) {
  if (!STATE_CHANGING_METHODS.has(request.method)) return;
  const origin = request.headers.get('origin');
  if (origin && !isAllowedOrigin(origin)) {
    throw ApiError.forbidden('Requests from this origin are not allowed');
  }
}

export async function readJsonBody(request) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw ApiError.badRequest('Send the request body as JSON (Content-Type: application/json)');
  }
  try {
    return await request.json();
  } catch {
    throw ApiError.badRequest('The request body is not valid JSON');
  }
}

export function getSearchParams(request) {
  return Object.fromEntries(new URL(request.url).searchParams);
}

export function handleApiError(error) {
  if (error instanceof ApiError) {
    return sendError(error.message, error.status, error.errors);
  }

  if (error?.name === 'ValidationError' && error.errors) {
    const errors = Object.fromEntries(
      Object.entries(error.errors).map(([field, detail]) => [field, detail.message]),
    );
    return sendError('Please check the highlighted fields', 400, errors);
  }

  if (error?.name === 'CastError') {
    return sendError('One of the identifiers in this request is not valid', 400);
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern ?? error.keyValue ?? {})[0];
    return sendError(
      field ? `A record with this ${field} already exists` : 'This record already exists',
      409,
      field ? { [field]: 'Already in use' } : undefined,
    );
  }

  if (isDatabaseConnectionError(error)) {
    console.error('[api] Database unavailable:', describeDatabaseError(error));
    return sendError('The database is unavailable right now. Please try again shortly.', 503);
  }

  if (error?.name === 'AuthConfigError') {
    console.error('[api] Auth misconfigured:', error.message);
    return sendError('Sign-in is not configured on the server yet.', 500);
  }

  console.error('[api] Unhandled error:', error);
  return sendError('Something went wrong on our side. Please try again.', 500);
}
