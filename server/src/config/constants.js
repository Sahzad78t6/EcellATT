export const ROLES = {
  ADMIN: 'ADMIN',
  SECRETARY: 'SECRETARY',
  LEAD: 'LEAD',
  MEMBER: 'MEMBER'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT'
};

export const ATTENDANCE_SOURCE = {
  MANUAL: 'manual',
  AUTO: 'auto',
  ADMIN_EDIT: 'admin-edit'
};

export const EVENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

export const EVENT_TYPES = [
  'General Body Meeting',
  'Vertical Meeting',
  'Workshop',
  'Event',
  'Other'
];

export const DEFAULT_VERTICALS = [
  { name: 'Creative & Designing', slug: 'creative-designing', description: 'Visual design, branding, and multimedia assets.' },
  { name: 'Corporate Communication', slug: 'corporate-communication', description: 'Industry outreach, corporate sponsorships, and B2B relations.' },
  { name: 'Resource & Counselling', slug: 'resource-counselling', description: 'Mentorship, internal training, and resource curation.' },
  { name: 'Media Relations', slug: 'media-relations', description: 'Press coverage, external media channels, and public announcements.' },
  { name: 'Public Relations', slug: 'public-relations', description: 'Audience engagement, campus outreach, and community networking.' },
  { name: 'Marketing', slug: 'marketing', description: 'Digital marketing, campaign execution, and social media promotions.' },
  { name: 'Finance & Logistics', slug: 'finance-logistics', description: 'Budget management, venue coordination, and logistical procurement.' }
];

export const EMAIL_TYPES = {
  LOW_ATTENDANCE: 'LOW_ATTENDANCE',
  WELCOME: 'WELCOME'
};

export const EMAIL_STATUS = {
  SENT: 'SENT',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED'
};

export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  PASSWORD_RESET: 'PASSWORD_RESET',
  ATTENDANCE_OVERRIDE: 'ATTENDANCE_OVERRIDE',
  BULK_IMPORT: 'BULK_IMPORT'
};
