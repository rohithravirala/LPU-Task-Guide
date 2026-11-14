import { apiHandler } from '@/lib/apiHandler';
import * as serviceController from '@/controllers/serviceController';

export const GET = apiHandler(serviceController.getService, { auth: 'optional' });
