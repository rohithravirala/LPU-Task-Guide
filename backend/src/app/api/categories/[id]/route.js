import { apiHandler } from '@/lib/apiHandler';
import * as categoryController from '@/controllers/categoryController';

export const PUT = apiHandler(categoryController.updateCategory, { roles: ['admin'] });
export const DELETE = apiHandler(categoryController.deleteCategory, { roles: ['admin'] });
