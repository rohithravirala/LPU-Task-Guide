import mongoose from 'mongoose';
import { defineModel } from '../lib/defineModel.js';

// A university task a student wants to do, e.g. "Upload an assignment".
// The ordered steps of the task are stored separately in TaskStep.
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }, // e.g. "Examinations & Results"
    summary: { type: String, required: true }, // one line for the task list
    description: { type: String, required: true }, // full explanation on the details page
    requirements: [String], // what the student should keep ready
    keywords: [String], // extra search words, e.g. "fine", "penalty"
    estimatedMinutes: Number,

    // Where the task is actually done (UMS, LPU Live, CodeTantra, NeoColab, LPU Touch)
    portal: { type: mongoose.Schema.Types.ObjectId, ref: 'UniversityService' },
    // Where to click inside that portal, e.g. ['Academics', 'Examination System', 'Academic Result']
    menuPath: [String],
    // The exact page on the portal. Only set after checking it; otherwise the portal's own link is used.
    url: { type: String, default: '' },
    isPopular: { type: Boolean, default: false }, // shown under "Quick links" on the dashboard

    isActive: { type: Boolean, default: true }, // hide a task without deleting it
  },
  { timestamps: true },
);

export default defineModel('Task', taskSchema);
