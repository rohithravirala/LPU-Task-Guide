import mongoose from 'mongoose';
import { defineModel } from '../lib/defineModel.js';

// One step of a task's journey. `order` decides the sequence (1, 2, 3 ...).
// `service` says which university service the student uses in this step.
const taskStepSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    instructions: [String], // what to do, in order
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'UniversityService' },
    note: String, // an important tip or warning
    isOptional: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Steps are always fetched by task and sorted by order, so index exactly that.
taskStepSchema.index({ task: 1, order: 1 });

export default defineModel('TaskStep', taskStepSchema);
