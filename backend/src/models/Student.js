import mongoose from 'mongoose';
import { defineModel } from '../lib/defineModel.js';

// A student who can log in to LPU Task Guide.
// We store only a bcrypt HASH of an app password. We never store the student's UMS password.
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    program: { type: String, trim: true, default: '' }, // e.g. "B.Tech CSE"
    // The shared demo account (created by `npm run seed`) also sees sample "updates",
    // because LPU has no public API to fetch a real student's data from.
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }, // adds createdAt and updatedAt
);

export default defineModel('Student', studentSchema);
