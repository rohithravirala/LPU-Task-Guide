import mongoose from 'mongoose';

/**
 * Shared Mongoose connection.
 *
 * Next.js re-evaluates modules during development (hot reload) and can reuse warm
 * server instances in production, so the connection promise is cached on `globalThis`.
 * Without this, every reload would open a new connection pool.
 *
 * This file uses relative imports only because the Node seed scripts import it too.
 */
const DEFAULT_DB_NAME = 'lpu-uni-path';
const AUTH_ERROR_CODES = new Set([18, 8000]); // 8000 = Atlas "bad auth"

const cache = globalThis.__lpuUniPathMongo ?? { conn: null, promise: null };
globalThis.__lpuUniPathMongo = cache;

/** True when the URI already names a database, e.g. ".../lpu-uni-path?retryWrites=true". */
function uriHasDatabase(uri) {
  const rest = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  const slash = rest.indexOf('/');
  if (slash === -1) return false;
  return rest.slice(slash + 1).split('?')[0].length > 0;
}

export async function connectDB() {
  if (cache.conn) return cache.conn;

  // Read at call time (not import time) so scripts can load .env files first.
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    const error = new Error(
      'MONGODB_URI is not set. Put your MongoDB connection string in backend/.env.local.',
    );
    error.name = 'DatabaseConfigError';
    throw error;
  }

  if (!cache.promise) {
    mongoose.set('strictQuery', true);
    const options = { bufferCommands: false, serverSelectionTimeoutMS: 10000, maxPoolSize: 10 };
    // Atlas connection strings usually omit the database name; use ours instead of "test".
    if (!uriHasDatabase(uri)) options.dbName = process.env.MONGODB_DB_NAME || DEFAULT_DB_NAME;
    cache.promise = mongoose.connect(uri, options);
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null; // allow the next request to retry
    throw error;
  }

  return cache.conn;
}

export async function disconnectDB() {
  if (!cache.conn) return;
  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
}

/** True for errors that mean "cannot reach or sign in to MongoDB" (not query errors). */
export function isDatabaseConnectionError(error) {
  if (!error) return false;
  const connectionErrorNames = [
    'DatabaseConfigError',
    'MongooseServerSelectionError',
    'MongoServerSelectionError',
    'MongoNetworkError',
    'MongoNetworkTimeoutError',
    'MongoParseError',
  ];
  if (connectionErrorNames.includes(error.name)) return true;
  if (AUTH_ERROR_CODES.has(error.code) || /bad auth|authentication failed/i.test(error.message ?? '')) return true;
  return typeof error.syscall === 'string' && error.syscall.startsWith('query'); // DNS (SRV) lookup failures
}

/** Plain-language explanation for logs and scripts. Never includes the password. */
export function describeDatabaseError(error) {
  const message = error?.message ?? String(error);

  if (error?.name === 'DatabaseConfigError') return message;
  if (AUTH_ERROR_CODES.has(error?.code) || /bad auth|authentication failed/i.test(message)) {
    return (
      'MongoDB rejected the username or password in MONGODB_URI. Check the database user in ' +
      'Atlas → Database Access, and URL-encode special characters in the password (e.g. @ → %40).'
    );
  }
  if (error?.name === 'MongoParseError' || /invalid scheme|URI must include|mongodb\+srv URI/i.test(message)) {
    return `MONGODB_URI is not a valid connection string: ${message}`;
  }
  if (/querySrv|ENOTFOUND|getaddrinfo/i.test(message)) {
    return (
      'The cluster address in MONGODB_URI could not be found. Copy the connection string again from ' +
      'Atlas → Connect → Drivers, and check your internet connection.'
    );
  }
  if (/whitelist|IP that isn't|access list/i.test(message)) {
    return "Atlas refused this computer's IP address. Add it in Atlas → Network Access → Add IP Address.";
  }
  if (/ECONNREFUSED/i.test(message)) {
    return 'Nothing is listening at the MongoDB address in MONGODB_URI. Is the database server running?';
  }
  if (/ServerSelection/.test(error?.name ?? '') || /timed out/i.test(message)) {
    return (
      'Could not reach MongoDB in time. In Atlas, check Network Access (your IP must be allowed), ' +
      `then check your internet connection. Details: ${message}`
    );
  }
  return message;
}
