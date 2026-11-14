import User from '../models/User.js';
import { getAuthCookieName, verifyAuthToken } from '../lib/jwt.js';

const OBJECT_ID = /^[a-f\d]{24}$/i;

/**
 * Resolves the signed-in user from the httpOnly auth cookie.
 * Returns the User document, or null for guests / invalid or expired tokens.
 *
 * The user is re-read from the database on every request so that deleted accounts
 * and role changes take effect immediately.
 */
export async function authenticate(request) {
  const token = request.cookies?.get(getAuthCookieName())?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload || typeof payload.sub !== 'string' || !OBJECT_ID.test(payload.sub)) return null;

  return User.findById(payload.sub).select('name email role registrationNumber createdAt');
}

export function isAdmin(user) {
  return user?.role === 'admin';
}

export function isStudent(user) {
  return user?.role === 'student';
}
