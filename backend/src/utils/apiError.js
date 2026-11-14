/**
 * Throw from controllers, services or validators; `apiHandler` turns it into the
 * standard JSON error envelope. Kept free of Next.js imports so plain Node scripts
 * (seed, tests) can use the same services and validators.
 */
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message = 'The request is invalid', errors) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Please sign in to continue') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have permission to do that') {
    return new ApiError(403, message);
  }

  static notFound(message = 'The requested item was not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'This conflicts with existing data', errors) {
    return new ApiError(409, message, errors);
  }
}
