import { login } from '@/controllers/authController';

// POST /api/auth/login
export async function POST(request) {
  return login(request);
}
