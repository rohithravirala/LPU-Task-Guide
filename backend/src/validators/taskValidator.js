import * as z from 'zod';
import { VERIFICATION_STATUSES } from '../models/constants.js';
import {
  limitQuery,
  nullableObjectIdSchema,
  objectIdSchema,
  optionalText,
  queryFlag,
  requiredText,
  textList,
} from './common.js';

export const TASK_SORTS = ['recommended', 'popular', 'title', 'updated'];

const stepSchema = z.object({
  // Present when editing an existing step; lets the server keep the step's id stable.
  _id: objectIdSchema.optional(),
  title: requiredText('Step title', { min: 3, max: 140 }),
  description: optionalText('Step description', 600),
  instructions: textList('Instructions', { maxItems: 20, maxLength: 500 }),
  serviceId: nullableObjectIdSchema.optional(),
  isRequired: z.boolean({ error: 'Required must be true or false' }).optional(),
  prerequisites: textList('Prerequisites', { maxItems: 15, maxLength: 300 }),
  additionalNotes: optionalText('Notes', 1000),
  checklist: textList('Checklist', { maxItems: 10, maxLength: 200 }),
});

const taskFields = {
  title: requiredText('Title', { min: 4, max: 120 }),
  summary: requiredText('Summary', { min: 10, max: 220 }),
  description: requiredText('Description', { min: 20, max: 4000 }),
  purpose: optionalText('Purpose', 1000),
  categoryId: z
    .string({ error: 'Choose a category' })
    .trim()
    .regex(/^[a-f\d]{24}$/i, 'Choose a category'),
  primaryServiceId: nullableObjectIdSchema.optional(),
  requirements: textList('Requirements', { maxItems: 20, maxLength: 300 }),
  importantNotes: textList('Important notes', { maxItems: 20, maxLength: 500 }),
  keywords: z
    .array(z.string().trim().toLowerCase().max(40, 'Keywords must be 40 characters or fewer'))
    .max(30, 'Use at most 30 keywords')
    .transform((items) => [...new Set(items.filter(Boolean))])
    .optional(),
  estimatedDuration: z
    .number({ error: 'Estimated time must be a number of minutes' })
    .int('Use whole minutes')
    .min(1, 'Estimated time must be at least 1 minute')
    .max(600, 'Estimated time must be 600 minutes or fewer')
    .nullable()
    .optional(),
  verificationStatus: z.enum(VERIFICATION_STATUSES).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  steps: z
    .array(stepSchema, { error: 'Steps must be a list' })
    .min(1, 'Add at least one journey step')
    .max(30, 'A journey can have at most 30 steps'),
};

// Unknown keys (slug, viewerCount, ...) are stripped, which prevents mass assignment.
export const createTaskSchema = z.object(taskFields);
export const updateTaskSchema = z.object(taskFields).partial();

export const taskListQuerySchema = z.object({
  category: z.string().trim().max(80).optional(),
  sort: z.enum(TASK_SORTS).default('recommended'),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: limitQuery(24, 100),
  featured: queryFlag,
  includeInactive: queryFlag,
});

export const taskSearchQuerySchema = z.object({
  q: z.string().trim().max(80, 'Search is limited to 80 characters').default(''),
  category: z.string().trim().max(80).optional(),
  limit: limitQuery(20, 50),
});

export const shortListQuerySchema = z.object({
  limit: limitQuery(6, 20),
});
