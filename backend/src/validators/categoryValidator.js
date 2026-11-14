import * as z from 'zod';
import { CATEGORY_ICONS } from '../models/constants.js';
import { optionalText, queryFlag, requiredText } from './common.js';

export const createCategorySchema = z.object({
  name: requiredText('Name', { min: 2, max: 60 }),
  code: z
    .string({ error: 'Code is required' })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2,4}$/, 'Code must be 2 to 4 letters'),
  description: optionalText('Description', 300),
  icon: z.enum(CATEGORY_ICONS, { error: 'Choose one of the available icons' }).optional(),
  order: z.number().int().min(0).max(999).optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryListQuerySchema = z.object({
  includeInactive: queryFlag,
});
