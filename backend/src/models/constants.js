// Shared enum values. Keep in sync with docs/data-model.md and the frontend labels.
export const USER_ROLES = ['student', 'admin'];
export const VERIFICATION_STATUSES = ['unverified', 'verified'];
export const SERVICE_TYPES = ['portal', 'mobile_app', 'department', 'help_desk', 'other'];

// Icon keys a category may use. The frontend maps each key to a lucide icon (CategoryIcon.jsx).
export const CATEGORY_ICONS = [
  'graduation-cap',
  'calendar-check',
  'clipboard-list',
  'wallet',
  'life-buoy',
  'file-text',
  'file-badge',
  'landmark',
  'book-open',
  'building',
  'megaphone',
  'folder',
];

// Shared schema options: expose virtuals in JSON, hide __v and the duplicate `id` virtual.
export const SCHEMA_OPTIONS = {
  timestamps: true,
  id: false,
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true },
};
