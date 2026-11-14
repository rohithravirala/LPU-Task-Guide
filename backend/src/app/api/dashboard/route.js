import { apiHandler } from '@/lib/apiHandler';
import * as dashboardController from '@/controllers/dashboardController';

export const GET = apiHandler(dashboardController.getDashboard, { auth: 'required' });
