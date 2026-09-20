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
import { PDF_RECORDS } from '../scripts/importPdfMembers.js';

async function seed() {
  console.log('🌱 Starting Complete Database Seeding (Admin & Heads + 183 Members)...');
  await mongoose.connect(ENV.MONGO_URI);
  console.log(' Connected to MongoDB:', ENV.MONGO_URI);

  // 1. Clear ALL collections
  await Promise.all([
    User.deleteMany({}),
    Vertical.deleteMany({}),
    Event.deleteMany({}),
    Attendance.deleteMany({}),
    Settings.deleteMany({}),
    EmailLog.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
  console.log(' Cleared old records from database.');

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
  console.log(' Created default settings.');

  // 3. Create Super Admin
  const adminSalt = await bcrypt.genSalt(12);
  const adminPasswordHash = await bcrypt.hash(ENV.ADMIN_PASSWORD || 'Admin@12345', adminSalt);

  const admin = await User.create({
    name: ENV.ADMIN_NAME || 'Super Admin',
    email: (ENV.ADMIN_EMAIL || 'admin@ecell.org').toLowerCase(),
    memberId: 'SUPERADMIN',
    passwordHash: adminPasswordHash,
    role: ROLES.ADMIN,
    vertical: null,
    phone: '+91 98765 43210',
    year: '4th Year',
    branch: 'Administration',
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

  // Mapping aliases
  verticalMap['resource & counselling'] = verticalMap['resource-counselling'];
  verticalMap['r&c'] = verticalMap['resource-counselling'];
  verticalMap['marketing'] = verticalMap['marketing'];
  verticalMap['media relations'] = verticalMap['media-relations'];
  verticalMap['finance & logistics'] = verticalMap['finance-logistics'];
  verticalMap['finance and logistics'] = verticalMap['finance-logistics'];
  verticalMap['corporate communication'] = verticalMap['corporate-communication'];
  verticalMap['corporate communications'] = verticalMap['corporate-communication'];
  verticalMap['creative designing'] = verticalMap['creative-designing'];
  verticalMap['creative & designing'] = verticalMap['creative-designing'];
  verticalMap['public relations'] = verticalMap['public-relations'];

  // 5. Create Official Leadership & Admin Accounts (@ecell.org / Password@123)
  const defaultPassword = 'Password@123';
  const salt = await bcrypt.genSalt(12);
  const defaultPasswordHash = await bcrypt.hash(defaultPassword, salt);

  const createdLeadership = [];
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
      position: member.designation,
      isActive: true,
      mustChangePassword: false,
      joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    });

    createdLeadership.push(user);

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

  // Update Verticals with Assigned Leads & Secretaries
  for (const vData of DEFAULT_VERTICALS) {
    const vDoc = verticalMap[vData.slug];
    if (vDoc) {
      const leads = verticalLeads[vData.slug] || [];
      const secs = verticalSecretaries[vData.slug] || [];

      vDoc.leads = leads;
      vDoc.secretary = secs.length > 0 ? secs[0] : null;
      vDoc.secretaries = secs;
      await vDoc.save();
    }
  }
  console.log(` Seeded ${createdLeadership.length} Official Leadership & Admin accounts.`);

  // 6. Create 183 Student Member Accounts from PDF Records
  const getVertical = (rec) => {
    if (!rec.vertical) return null;
    const vKey = rec.vertical.toLowerCase().trim();
    return verticalMap[vKey] || null;
  };

  const createdMembers = [];
  let seqNumber = 1;

  for (const rec of PDF_RECORDS) {
    const seqStr = String(seqNumber).padStart(3, '0');
    const memberId = `ECELL_${seqStr}`;
    seqNumber++;

    // Password: registrationnumber_ecell
    const plainPassword = `${rec.regNo.trim()}_ecell`;
    const memSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, memSalt);

    const vDoc = getVertical(rec);

    const user = await User.create({
      name: rec.name.trim(),
      email: rec.email.toLowerCase().trim(),
      memberId,
      passwordHash,
      role: ROLES.MEMBER, // Student access
      vertical: vDoc ? vDoc._id : null,
      phone: rec.phone.trim(),
      year: rec.year.trim(),
      branch: rec.branch.trim(),
      registrationNumber: rec.regNo.trim(),
      gender: rec.gender.trim(),
      position: rec.position.trim(),
      linkedinUrl: rec.linkedin.trim(),
      residence: rec.residence.trim(),
      isActive: true,
      mustChangePassword: false,
      joinedAt: new Date(rec.timestamp ? new Date(rec.timestamp).getTime() : Date.now() - 90 * 24 * 60 * 60 * 1000)
    });

    createdMembers.push(user);
  }

  console.log(` Seeded ${createdMembers.length} Student Member accounts from PDF records.`);

  console.log('\n======================================================');
  console.log('✅ DATABASE SEEDED SUCCESSFULLY WITH ALL CREDENTIALS!');
  console.log(`- Super Admin: 1 (admin@ecell.org)`);
  console.log(`- Leadership & Admins: ${createdLeadership.length} (@ecell.org / Password@123)`);
  console.log(`- Student Members: ${createdMembers.length} (ECELL_001 to ECELL_183 / <regNo>_ecell)`);
  console.log(`- Total Database Users: ${1 + createdLeadership.length + createdMembers.length}`);
  console.log('======================================================');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed script error:', err);
  process.exit(1);
});
