import mongoose from 'mongoose';

// A university portal, app or office that a step sends the student to
// (UMS, LPU Touch, Examination Office ...).
const universityServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Portal', 'Mobile App', 'Office', 'Help Desk'], required: true },
    description: String,
    // Only put an official link here after the team has checked it is correct.
    url: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.models.UniversityService ||
  mongoose.model('UniversityService', universityServiceSchema);
