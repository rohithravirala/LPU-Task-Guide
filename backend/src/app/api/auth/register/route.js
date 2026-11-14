import { register } from '@/controllers/authController';

// POST /api/auth/register  (sign up)
export async function POST(request) {
  return register(request);
}
