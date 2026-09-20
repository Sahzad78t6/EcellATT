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
import { PDF_RECORDS } from '../scripts/importPdfMembers.js';

async function seed() {
  console.log('🌱 Starting Database Reset with Official Members from PDF...');
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
  console.log(' Cleared all records from database.');

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

  const getRole = (rec) => {
    const pos = (rec.position || '').toLowerCase();
    const name = rec.name.toLowerCase();

    if (pos.includes('team representative') || pos.includes('vtr') || name.includes('nikhilesh') || name.includes('rakesh') || name.includes('sri latha')) {
      return ROLES.ADMIN;
    }
    if (pos.includes('lead') && name.includes('vasanta')) {
      return ROLES.ADMIN;
    }
    if (pos.includes('lead')) {
      return ROLES.LEAD;
    }
    if (pos.includes('secretary')) {
      return ROLES.SECRETARY;
    }
    return ROLES.MEMBER;
  };

  const getVertical = (rec) => {
    if (!rec.vertical) return null;
    const vKey = rec.vertical.toLowerCase().trim();
    return verticalMap[vKey] || null;
  };

  // 5. Create Official Members from PDF Records
  const createdUsers = [];
  const verticalLeads = {};
  const verticalSecretaries = {};

  let seqNumber = 1;

  for (const rec of PDF_RECORDS) {
    const seqStr = String(seqNumber).padStart(3, '0');
    const memberId = `ECELL_${seqStr}`;
    seqNumber++;

    // Password: registrationnumber_ecell
    const plainPassword = `${rec.regNo.trim()}_ecell`;
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    const vDoc = getVertical(rec);
    const role = getRole(rec);

    const user = await User.create({
      name: rec.name.trim(),
      email: rec.email.toLowerCase().trim(),
      memberId,
      passwordHash,
      role,
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

    createdUsers.push(user);

    if (vDoc) {
      const vSlug = vDoc.slug;
      if (!verticalLeads[vSlug]) verticalLeads[vSlug] = [];
      if (!verticalSecretaries[vSlug]) verticalSecretaries[vSlug] = [];

      if (role === ROLES.LEAD || (role === ROLES.ADMIN && rec.position.toLowerCase().includes('lead'))) {
        verticalLeads[vSlug].push(user._id);
      }
      if (role === ROLES.SECRETARY) {
        verticalSecretaries[vSlug].push(user._id);
      }
    }
  }

  // 6. Update Verticals with Assigned Leads & Secretaries
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

  console.log('\n======================================================');
  console.log(`✅ DATABASE SEEDED WITH ${createdUsers.length} OFFICIAL MEMBERS`);
  console.log(`- Member IDs: ECELL_001 to ECELL_${String(createdUsers.length).padStart(3, '0')}`);
  console.log(`- Passwords: <RegistrationNumber>_ecell (e.g. 251FK01021_ecell)`);
  console.log('- All student fields saved in MongoDB.');
  console.log('======================================================');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed script error:', err);
  process.exit(1);
});
