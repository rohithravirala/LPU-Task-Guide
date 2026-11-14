import { readJsonBody } from '../lib/apiHandler.js';
import { authCookieOptions, getAuthCookieName, signAuthToken } from '../lib/jwt.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parseWith } from '../validators/common.js';
import { loginSchema, registerSchema } from '../validators/authValidator.js';
import * as authService from '../services/authService.js';

function startSession(response, user) {
  response.cookies.set(getAuthCookieName(), signAuthToken(user), authCookieOptions());
  return response;
}

export async function register({ request }) {
  const input = parseWith(registerSchema, await readJsonBody(request));
  const user = await authService.registerStudent(input);
  const response = sendSuccess(authService.toPublicUser(user), 'Your account has been created', {
    status: 201,
  });
  return startSession(response, user);
}

export async function login({ request }) {
  const input = parseWith(loginSchema, await readJsonBody(request));
  const user = await authService.verifyCredentials(input);
  return startSession(sendSuccess(authService.toPublicUser(user), 'Signed in successfully'), user);
}

export async function logout() {
  const response = sendSuccess(null, 'Signed out');
  response.cookies.set(getAuthCookieName(), '', { ...authCookieOptions(), maxAge: 0 });
  return response;
}

export async function me({ user }) {
  return sendSuccess(authService.toPublicUser(user), 'Current user retrieved');
}
