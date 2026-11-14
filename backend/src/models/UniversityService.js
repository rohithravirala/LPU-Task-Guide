import mongoose from 'mongoose';
import { defineModel } from '../lib/defineModel.js';

// A university portal, app or office that a step sends the student to
// (UMS, LPU Live, CodeTantra, Examination Office ...).
//
// A "portal" (isPortal: true) is a place where tasks are actually done online:
// UMS, LPU Live, CodeTantra, NeoColab and LPU Touch. Each task belongs to one portal,
// and its "Open" button takes the student there.
const universityServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Portal', 'Mobile App', 'Office', 'Help Desk'], required: true },
    description: String,
    // Only put an official link here after the team has checked it is correct.
    url: { type: String, default: '' },

    // ---- Only used by portals ----
    isPortal: { type: Boolean, default: false },
    slug: String, // used in page addresses, e.g. /?portal=ums
    shortName: String, // label on the small portal badge, e.g. "UMS"
    order: { type: Number, default: 0 }, // order of the portal tabs
    openHint: String, // how to open it and log in
    menuHint: String, // where its menus are, used in the generated steps
    alternateUrl: { type: String, default: '' }, // a second official link, e.g. the App Store
    alternateLabel: String,
  },
  { timestamps: true },
);

export default defineModel('UniversityService', universityServiceSchema);
