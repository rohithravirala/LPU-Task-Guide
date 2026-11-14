import mongoose from 'mongoose';

// A student who can log in to LPU-Uni-Path.
// We store only a bcrypt HASH of an app password. We never store the student's UMS password.
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    program: { type: String, trim: true, default: '' }, // e.g. "B.Tech CSE"
  },
  { timestamps: true }, // adds createdAt and updatedAt
);

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
