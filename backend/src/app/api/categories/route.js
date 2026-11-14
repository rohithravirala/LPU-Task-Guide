import { apiHandler } from '@/lib/apiHandler';
import * as categoryController from '@/controllers/categoryController';

export const GET = apiHandler(categoryController.getCategories, { auth: 'optional' });
export const POST = apiHandler(categoryController.createCategory, { roles: ['admin'] });
