import mongoose from 'mongoose';
import { SCHEMA_OPTIONS, VERIFICATION_STATUSES } from './constants.js';

const { Schema } = mongoose;

const textList = (maxlength) => ({
  type: [{ type: String, trim: true, maxlength }],
  default: [],
});

/**
 * A student task, e.g. "Check your attendance". Its ordered steps live in the
 * TaskStep collection (see TaskStep.js) so steps can be edited independently.
 */
const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    // Generated once from the title and kept stable so links keep working.
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    summary: { type: String, required: true, trim: true, maxlength: 220 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    purpose: { type: String, trim: true, maxlength: 1000, default: '' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    primaryServiceId: { type: Schema.Types.ObjectId, ref: 'Service', default: null },
    requirements: textList(300),
    importantNotes: textList(500),
    keywords: { type: [{ type: String, trim: true, lowercase: true, maxlength: 40 }], default: [] },
    // Minutes. Optional: only set when it can be reasonably estimated.
    estimatedDuration: { type: Number, min: 1, max: 600, default: null },
    verificationStatus: { type: String, enum: VERIFICATION_STATUSES, default: 'unverified' },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    // Distinct students who opened this task. Maintained by taskService.recordTaskView.
    viewerCount: { type: Number, default: 0, min: 0 },
  },
  SCHEMA_OPTIONS,
);

taskSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

taskSchema.virtual('primaryService', {
  ref: 'Service',
  localField: 'primaryServiceId',
  foreignField: '_id',
  justOne: true,
});

taskSchema.virtual('stepCount', {
  ref: 'TaskStep',
  localField: '_id',
  foreignField: 'taskId',
  count: true,
});

taskSchema.index({ isActive: 1, categoryId: 1 });
taskSchema.index({ isActive: 1, viewerCount: -1 });

export default mongoose.models.Task || mongoose.model('Task', taskSchema);
