import { getServices } from '@/controllers/helpController';

// GET /api/services
export async function GET(request) {
  return getServices(request);
}
