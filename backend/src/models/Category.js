import mongoose from 'mongoose';
import { CATEGORY_ICONS, SCHEMA_OPTIONS } from './constants.js';

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60, unique: true },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    // Short wayfinding code shown on task cards, e.g. "ATT" for Attendance.
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z]{2,4}$/,
      unique: true,
    },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    icon: { type: String, enum: CATEGORY_ICONS, default: 'folder' },
    order: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  SCHEMA_OPTIONS,
);

categorySchema.index({ isActive: 1, order: 1 });

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
