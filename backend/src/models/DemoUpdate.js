import mongoose from 'mongoose';
import { defineModel } from '../lib/defineModel.js';

// One SAMPLE update for the demo account, e.g. "CSC301 assignment due in 2 days".
// With an official LPU API these would come live from UMS, LPU Live, CodeTantra ...;
// LPU has no public API, so the demo account shows these instead. Every update points
// to the task that handles it, so its "Steps" and "Open" buttons work like a real one.
const demoUpdateSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    kind: { type: String, enum: ['deadline', 'alert', 'update'], default: 'update' },
    title: { type: String, required: true },
    detail: String,
    // A deadline is stored as "days from today", so the demo never shows an old date
    dueInDays: Number,
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default defineModel('DemoUpdate', demoUpdateSchema);
