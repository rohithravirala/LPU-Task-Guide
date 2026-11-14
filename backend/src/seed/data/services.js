/**
 * Sample services ("One Student, Seven Portals").
 * No official URLs are included on purpose: every service is `unverified` until an
 * admin confirms its address and responsibilities against an official source.
 */
export const services = [
  {
    key: 'ums',
    name: 'UMS',
    shortName: 'UMS',
    serviceType: 'portal',
    description:
      'University Management System, the student web portal commonly used for academic records and requests. Exact features to be verified.',
    accessNotes:
      'Sign in with your university credentials using an officially shared address. The official link will appear here once verified.',
  },
  {
    key: 'touch',
    name: 'LPU Touch',
    shortName: 'Touch',
    serviceType: 'mobile_app',
    description:
      'University mobile app for students. Which tasks it supports is to be verified.',
    accessNotes:
      'Install only from your device’s official app store and check the publisher before signing in.',
  },
  {
    key: 'live',
    name: 'LPU Live',
    shortName: 'Live',
    serviceType: 'other',
    description:
      'University communication platform referenced by students. Its role in each task is to be verified.',
    accessNotes: 'Access details to be verified.',
  },
  {
    key: 'exam-office',
    name: 'Examination Office',
    serviceType: 'department',
    description:
      'The office responsible for examination matters. Official name, location and contact details to be verified.',
    accessNotes: 'Use the contact details published in official examination notices.',
  },
  {
    key: 'accounts',
    name: 'Accounts Office',
    serviceType: 'department',
    description:
      'Handles fee and payment queries. Official name, location and contact details to be verified.',
    accessNotes: 'Keep your registration number and any transaction reference ready when you contact them.',
  },
  {
    key: 'help-desk',
    name: 'Student Help Desk',
    serviceType: 'help_desk',
    description:
      'General help point for students who are unsure where to go. Official channels to be verified.',
    accessNotes: 'Describe your issue, the service you were using and any error message you saw.',
  },
  {
    key: 'department',
    name: 'School / Department Office',
    serviceType: 'department',
    description:
      'Your own school or department office, usually the right place for course-specific questions.',
    accessNotes: 'Your class coordinator or faculty advisor can tell you who to contact.',
  },
];
