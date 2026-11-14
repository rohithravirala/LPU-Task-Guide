import mongoose from 'mongoose';
import { SCHEMA_OPTIONS, SERVICE_TYPES, VERIFICATION_STATUSES } from './constants.js';

const { Schema } = mongoose;

/**
 * A university service a student may need: a portal (UMS), an app (LPU Touch),
 * a department or a help desk. LPU-Uni-Path only points students to these services;
 * it never performs transactions on their behalf.
 */
const serviceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80, unique: true },
    shortName: { type: String, trim: true, maxlength: 24, default: '' },
    description: { type: String, trim: true, maxlength: 600, default: '' },
    serviceType: { type: String, enum: SERVICE_TYPES, default: 'portal' },
    officialUrl: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: (value) => !value || /^https?:\/\/\S+$/i.test(value),
        message: 'Official URL must start with http:// or https://',
      },
    },
    // Links are only shown to students once an admin has verified them.
    verificationStatus: { type: String, enum: VERIFICATION_STATUSES, default: 'unverified' },
    accessNotes: { type: String, trim: true, maxlength: 600, default: '' },
    isActive: { type: Boolean, default: true },
  },
  SCHEMA_OPTIONS,
);

/** True only when the link is verified AND present. The UI never links otherwise. */
serviceSchema.virtual('linkAvailable').get(function linkAvailable() {
  return this.verificationStatus === 'verified' && Boolean(this.officialUrl);
});

serviceSchema.index({ isActive: 1, name: 1 });

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);
