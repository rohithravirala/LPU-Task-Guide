import { NextResponse } from 'next/server';

/**
 * Every endpoint answers with the same envelope so the frontend can handle
 * responses in one place (see frontend/src/services/api.js).
 *
 *   success: { success: true,  message, data, meta? }
 *   error:   { success: false, message, errors? }
 *
 * To return an error from deep inside a service, throw ApiError (utils/apiError.js).
 */
export function sendSuccess(data = null, message = 'Request completed successfully', options = {}) {
  const { status = 200, meta } = options;
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status });
}

export function sendError(message = 'Something went wrong', status = 500, errors) {
  const body = { success: false, message };
  if (errors && Object.keys(errors).length) body.errors = errors;
  return NextResponse.json(body, { status });
}
