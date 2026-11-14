import * as z from 'zod';
import { requiredText } from './common.js';

const emailSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
  z.email({ error: 'Enter a valid email address' }).max(254, 'Email is too long'),
);

export const registerSchema = z.object({
  name: requiredText('Name', { min: 2, max: 80 }),
  email: emailSchema,
  // bcrypt only uses the first 72 bytes, so longer passwords are rejected explicitly.
  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Use at least 8 characters')
    .max(72, 'Use 72 characters or fewer'),
  registrationNumber: z
    .string({ error: 'Registration number must be text' })
    .trim()
    .toUpperCase()
    .max(20, 'Registration number must be 20 characters or fewer')
    .regex(/^[A-Z0-9-]*$/, 'Use letters, numbers or hyphens only')
    .optional()
    .transform((value) => value || undefined),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Email is required'),
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
});
