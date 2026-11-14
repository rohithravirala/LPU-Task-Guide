import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from './constants.js';

const { Schema } = mongoose;

/**
 * Records that a student opened a task. Powers "Recently opened" (per student) and
 * "Popular" (distinct students per task, denormalised into Task.viewerCount).
 * The student id always comes from the verified session, never from the request body.
 */
const taskViewSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    viewCount: { type: Number, default: 1, min: 1 },
    lastViewedAt: { type: Date, default: Date.now },
  },
  SCHEMA_OPTIONS,
);

taskViewSchema.virtual('task', {
  ref: 'Task',
  localField: 'taskId',
  foreignField: '_id',
  justOne: true,
});

taskViewSchema.index({ studentId: 1, taskId: 1 }, { unique: true });
taskViewSchema.index({ studentId: 1, lastViewedAt: -1 });
taskViewSchema.index({ taskId: 1 });

export default mongoose.models.TaskView || mongoose.model('TaskView', taskViewSchema);
