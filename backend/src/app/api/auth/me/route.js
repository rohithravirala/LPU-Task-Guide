import { apiHandler } from '@/lib/apiHandler';
import * as authController from '@/controllers/authController';

export const GET = apiHandler(authController.me, { auth: 'required' });
