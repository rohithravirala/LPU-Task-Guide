import { getSearchParams, readJsonBody } from '../lib/apiHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parseWith } from '../validators/common.js';
import {
  categoryListQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validators/categoryValidator.js';
import * as categoryService from '../services/categoryService.js';

export async function getCategories({ request, user }) {
  const query = parseWith(categoryListQuerySchema, getSearchParams(request));
  const categories = await categoryService.listCategories(query, user);
  return sendSuccess(categories, 'Categories retrieved successfully');
}

export async function createCategory({ request }) {
  const input = parseWith(createCategorySchema, await readJsonBody(request));
  const category = await categoryService.createCategory(input);
  return sendSuccess(category, 'Category created', { status: 201 });
}

export async function updateCategory({ request, params }) {
  const input = parseWith(updateCategorySchema, await readJsonBody(request));
  const category = await categoryService.updateCategory(params.id, input);
  return sendSuccess(category, 'Category updated');
}

export async function deleteCategory({ params }) {
  const result = await categoryService.deleteCategory(params.id);
  return sendSuccess(result, 'Category deleted');
}
