import { getUpdates } from '@/controllers/updateController';

// GET /api/updates
export async function GET(request) {
  return getUpdates(request);
}
