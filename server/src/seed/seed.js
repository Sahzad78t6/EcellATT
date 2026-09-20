import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Vertical } from '../models/Vertical.js';
import { Event } from '../models/Event.js';
import { Attendance } from '../models/Attendance.js';
import { Settings } from '../models/Settings.js';
import { EmailLog } from '../models/EmailLog.js';
import { AuditLog } from '../models/AuditLog.js';
import { ROLES, DEFAULT_VERTICALS } from '../config/constants.js';
import { ENV } from '../config/env.js';
import { TEAM_MEMBERS } from '../scripts/setupTeamMembers.js';

async function seed() {
  console.log('🌱 Starting Database Reset (Production Clean Mode)...');
  await mongoose.connect(ENV.MONGO_URI);
  console.log(' Connected to MongoDB:', ENV.MONGO_URI);

  // 1. Clear ALL collections (removing all dummy users, events, attendance, logs)
  await Promise.all([
    User.deleteMany({}),
    Vertical.deleteMany({}),
    Event.deleteMany({}),
    Attendance.deleteMany({}),
    Settings.deleteMany({}),
    EmailLog.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
  console.log(' Cleared all dummy records from database.');

  // 2. Create Default Settings
  const settings = await Settings.create({
    lowAttendanceThreshold: 75,
    minEventsForAlert: 3,
    alertCooldownDays: 7,
    autoCloseBufferMinutes: 30,
    emailAlertsEnabled: true,
    currentSession: '2024-2025',
    timezone: ENV.TIMEZONE
  });
  console.log(' Created default settings (Threshold: 75%, Session: 2024-2025).');

  // 3. Create Super Admin
  const adminSalt = await bcrypt.genSalt(12);
  const adminPasswordHash = await bcrypt.hash(ENV.ADMIN_PASSWORD, adminSalt);

  const admin = await User.create({
    name: ENV.ADMIN_NAME,
    email: ENV.ADMIN_EMAIL.toLowerCase(),
    memberId: ENV.ADMIN_MEMBER_ID.toUpperCase(),
    passwordHash: adminPasswordHash,
    role: ROLES.ADMIN,
    vertical: null,
    phone: '+91 98765 43210',
    year: '4th Year',
    branch: 'Computer Science',
    isActive: true,
    mustChangePassword: false,
    joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  });
  console.log(` Created Super Admin: ${admin.email}`);

  // 4. Create 7 Official Verticals
  const verticalMap = {};
  const verticalDocs = [];
  for (const vData of DEFAULT_VERTICALS) {
    const vDoc = await Vertical.create({
      name: vData.name,
      slug: vData.slug,
      description: vData.description,
      isActive: true
    });
    verticalDocs.push(vDoc);
    verticalMap[vData.slug] = vDoc;
  }
  console.log(` Seeded ${verticalDocs.length} Core Verticals.`);

  // 5. Create Official Team Members
  const defaultPassword = 'Password@123';
  const salt = await bcrypt.genSalt(12);
  const defaultPasswordHash = await bcrypt.hash(defaultPassword, salt);

  const allTeamUsers = [];
  const verticalLeads = {};
  const verticalSecretaries = {};

  for (const member of TEAM_MEMBERS) {
    const vDoc = member.verticalSlug ? verticalMap[member.verticalSlug] : null;

    const user = await User.create({
      name: member.name,
      email: member.email.toLowerCase(),
      memberId: member.memberId.toUpperCase(),
      passwordHash: defaultPasswordHash,
      role: member.role,
      vertical: vDoc ? vDoc._id : null,
      phone: member.phone,
      year: member.year,
      branch: member.branch,
      isActive: true,
      mustChangePassword: false,
      joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    });

    allTeamUsers.push(user);

    if (member.verticalSlug) {
      if (!verticalLeads[member.verticalSlug]) verticalLeads[member.verticalSlug] = [];
      if (!verticalSecretaries[member.verticalSlug]) verticalSecretaries[member.verticalSlug] = [];

      if (member.role === ROLES.LEAD || (member.role === ROLES.ADMIN && member.designation.includes('Lead'))) {
        verticalLeads[member.verticalSlug].push(user._id);
      }
      if (member.role === ROLES.SECRETARY) {
        verticalSecretaries[member.verticalSlug].push(user._id);
      }
    }
  }

  // 6. Update Verticals with Assigned Leads & Secretaries
  for (const [slug, vDoc] of Object.entries(verticalMap)) {
    const leads = verticalLeads[slug] || [];
    const secs = verticalSecretaries[slug] || [];

    vDoc.leads = leads;
    vDoc.secretary = secs.length > 0 ? secs[0] : null;
    vDoc.secretaries = secs;
    await vDoc.save();
  }
  console.log(` Seeded ${allTeamUsers.length} official team members (ZERO dummy users).`);

  console.log('\n======================================================');
  console.log('✅ DATABASE IS COMPLETELY CLEAN: ZERO DUMMY DATA');
  console.log(`- Users: ${allTeamUsers.length + 1} (Official team + Super Admin)`);
  console.log(`- Verticals: ${verticalDocs.length} (Official core branches)`);
  console.log('- Events: 0 (Ready for real events to be created)');
  console.log('- Attendance: 0 (Ready for real attendance marking)');
  console.log('======================================================');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed script error:', err);
  process.exit(1);
});
