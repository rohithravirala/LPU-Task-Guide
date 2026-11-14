import mongoose from 'mongoose';

// Next.js reloads files during development. To avoid opening a new database
// connection on every reload/request, we keep ONE connection on `globalThis`.
const cached = globalThis.mongooseConnection ?? { conn: null, promise: null };
globalThis.mongooseConnection = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn; // already connected

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add it to backend/.env.local');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || 'lpuTaskGuide', // database inside the Atlas cluster
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // let the next request try again
    throw error;
  }
  return cached.conn;
}
