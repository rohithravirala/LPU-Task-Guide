import mongoose from 'mongoose';
import { USER_ROLES } from './constants.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // Never selected unless explicitly requested with .select('+passwordHash')
    passwordHash: { type: String, required: true, select: false },
    registrationNumber: { type: String, trim: true, uppercase: true, maxlength: 20 },
    // Registration always creates students; admins are created by the seed script.
    role: { type: String, enum: USER_ROLES, default: 'student' },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret) {
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

// Unique only when a registration number was actually provided.
userSchema.index(
  { registrationNumber: 1 },
  { unique: true, partialFilterExpression: { registrationNumber: { $type: 'string' } } },
);

export default mongoose.models.User || mongoose.model('User', userSchema);
