import { apiHandler } from '@/lib/apiHandler';
import * as authController from '@/controllers/authController';

export const POST = apiHandler(authController.login);
