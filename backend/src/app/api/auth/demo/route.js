import { demoLogin } from '@/controllers/authController';

// POST /api/auth/demo  ->  signs in as the demo account (the "Try demo" button)
export async function POST() {
  return demoLogin();
}
