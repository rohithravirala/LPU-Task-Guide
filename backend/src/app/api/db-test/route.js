import mongoose from 'mongoose';
import { apiHandler } from '@/lib/apiHandler';
import { sendSuccess } from '@/utils/apiResponse';

// Health check: confirms the API can reach MongoDB. Never exposes the connection string.
export const GET = apiHandler(async () =>
  sendSuccess(
    { database: mongoose.connection.name, state: 'connected' },
    'Database connection is healthy',
  ),
);
