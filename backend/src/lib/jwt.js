import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRY = '7d';
const UNIT_SECONDS = { s: 1, m: 60, h: 3600, d: 86400 };

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    const error = new Error(
      'JWT_SECRET must be a random string of at least 32 characters (see backend/.env.example).',
    );
    error.name = 'AuthConfigError';
    throw error;
  }
  return secret;
}

function getExpiry() {
  return process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRY;
}

/** Converts "7d" / "12h" / "3600" into seconds for the cookie's maxAge. */
function expiryToSeconds(expiry) {
  const match = /^(\d+)\s*([smhd])?$/i.exec(String(expiry).trim());
  if (!match) return 7 * UNIT_SECONDS.d;
  const unit = (match[2] || 's').toLowerCase();
  return Number(match[1]) * UNIT_SECONDS[unit];
}

export function getAuthCookieName() {
  return process.env.AUTH_COOKIE_NAME || 'lpu_uni_path_token';
}

export function signAuthToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, getSecret(), {
    algorithm: 'HS256',
    expiresIn: getExpiry(),
  });
}

/** Returns the token payload, or null when the token is missing, expired or tampered with. */
export function verifyAuthToken(token) {
  const secret = getSecret(); // configuration errors should surface, not look like "logged out"
  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}

export function authCookieOptions() {
  const sameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
  const secureSetting = process.env.COOKIE_SECURE;
  const secure =
    sameSite === 'none' // browsers reject SameSite=None cookies without Secure
      ? true
      : secureSetting
        ? secureSetting === 'true'
        : process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    sameSite,
    secure,
    path: '/',
    maxAge: expiryToSeconds(getExpiry()),
  };
}
