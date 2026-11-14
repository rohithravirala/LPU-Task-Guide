import mongoose from 'mongoose';

// A frequently asked question. `task` is optional: when set, the FAQ is also
// shown at the bottom of that task's journey page.
const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: String,
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    keywords: [String],
  },
  { timestamps: true },
);

export default mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);
