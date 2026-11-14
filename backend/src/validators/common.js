import * as z from 'zod';
import { ApiError } from '../utils/apiError.js';

export const objectIdSchema = z
  .string({ error: 'A valid identifier is required' })
  .trim()
  .regex(/^[a-f\d]{24}$/i, 'A valid identifier is required');

/** Accepts an ObjectId, '' or null. '' and null both mean "not set". */
export const nullableObjectIdSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  objectIdSchema.nullable(),
);

export const requiredText = (label, { min = 1, max }) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, min === 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`);

export const optionalText = (label, max) =>
  z
    .string({ error: `${label} must be text` })
    .trim()
    .max(max, `${label} must be ${max} characters or fewer`)
    .optional();

/** A list of short texts: trims each item and drops empty lines. */
export const textList = (label, { maxItems, maxLength }) =>
  z
    .array(
      z
        .string({ error: `${label} items must be text` })
        .trim()
        .max(maxLength, `Each ${label.toLowerCase()} item must be ${maxLength} characters or fewer`),
      { error: `${label} must be a list` },
    )
    .max(maxItems, `${label} can have at most ${maxItems} items`)
    .transform((items) => items.filter(Boolean))
    .optional();

/** Query-string booleans: "true" / "false". */
export const queryFlag = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true'));

export const limitQuery = (fallback, max) => z.coerce.number().int().min(1).max(max).default(fallback);

/** Converts zod issues into `{ "steps.0.title": "message" }` for form-level display. */
export function formatZodError(error) {
  const errors = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join('.') : '_form';
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Validates input and throws a 400 ApiError with field messages on failure. */
export function parseWith(schema, input) {
  const result = schema.safeParse(input ?? {});
  if (!result.success) {
    throw ApiError.badRequest('Please check the highlighted fields', formatZodError(result.error));
  }
  return result.data;
}
