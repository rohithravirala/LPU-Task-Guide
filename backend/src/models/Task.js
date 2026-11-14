import mongoose from 'mongoose';

// A university task a student wants to do, e.g. "Pay an examination fine".
// The ordered steps of the task are stored separately in TaskStep.
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }, // e.g. "Examinations"
    summary: { type: String, required: true }, // one line for the task card
    description: { type: String, required: true }, // full explanation on the details page
    requirements: [String], // what the student should keep ready
    keywords: [String], // extra search words, e.g. "fine", "penalty"
    estimatedMinutes: Number,
    isActive: { type: Boolean, default: true }, // hide a task without deleting it
  },
  { timestamps: true },
);

export default mongoose.models.Task || mongoose.model('Task', taskSchema);
