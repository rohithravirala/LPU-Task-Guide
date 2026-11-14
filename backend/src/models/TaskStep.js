import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from './constants.js';

const { Schema } = mongoose;

const textList = (maxlength) => ({
  type: [{ type: String, trim: true, maxlength }],
  default: [],
});

/**
 * One station on a task's journey. `order` is kept sequential (1..n) by the task
 * service, and step `_id`s are preserved when an admin edits a task so that saved
 * student progress (which stores step ids) stays valid.
 */
const taskStepSchema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    order: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 600, default: '' },
    instructions: textList(500),
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', default: null },
    isRequired: { type: Boolean, default: true },
    prerequisites: textList(300),
    additionalNotes: { type: String, trim: true, maxlength: 1000, default: '' },
    // "Done when..." self-check items shown before marking the step complete.
    checklist: textList(200),
  },
  SCHEMA_OPTIONS,
);

taskStepSchema.virtual('service', {
  ref: 'Service',
  localField: 'serviceId',
  foreignField: '_id',
  justOne: true,
});

taskStepSchema.index({ taskId: 1, order: 1 });
taskStepSchema.index({ serviceId: 1 });

export default mongoose.models.TaskStep || mongoose.model('TaskStep', taskStepSchema);
