/**
 * Checks that the backend can reach MongoDB with the settings in .env.local.
 * Changes no data.
 *
 *   npm run db:check
 */
import './loadEnv.js';
import { connectDB, describeDatabaseError, disconnectDB } from '../lib/mongodb.js';

try {
  const { connection } = await connectDB();
  await connection.db.command({ ping: 1 });
  console.log(`✓ Connected to MongoDB: database "${connection.name}" on ${connection.host}`);
} catch (error) {
  console.error(`✗ Could not connect. ${describeDatabaseError(error)}`);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
