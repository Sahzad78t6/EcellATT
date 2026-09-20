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

export const TEAM_MEMBERS = [
  // Admins
  {
    name: 'Nikhilesh',
    phone: '7207336271',
    role: ROLES.ADMIN,
    email: 'nikhilesh@ecell.org',
    memberId: 'EC24TR01',
    designation: 'Team Representative',
    verticalSlug: null,
    year: '4th Year',
    branch: 'Computer Science'
  },
  {
    name: 'B. Rakesh',
    phone: '7993114713',
    role: ROLES.ADMIN,
    email: 'rakesh.b@ecell.org',
    memberId: 'EC24VTR01',
    designation: 'Vice Team Representative',
    verticalSlug: null,
    year: '4th Year',
    branch: 'Information Technology'
  },
  {
    name: 'Sri Latha',
    phone: '7382618080',
    role: ROLES.ADMIN,
    email: 'srilatha@ecell.org',
    memberId: 'EC24VTR02',
    designation: 'Vice Team Representative',
    verticalSlug: null,
    year: '4th Year',
    branch: 'Electronics & Communication'
  },

  // Resource & Counselling (Lead is Admin)
  {
    name: 'Vasanta',
    phone: '9949528256',
    role: ROLES.ADMIN,
    email: 'vasanta@ecell.org',
    memberId: 'EC24RC01',
    designation: 'Resource & Counselling Lead (Admin)',
    verticalSlug: 'resource-counselling',
    year: '3rd Year',
    branch: 'Computer Science'
  },
  {
    name: 'Chaitya',
    phone: '7893879099',
    role: ROLES.SECRETARY,
    email: 'chaitya@ecell.org',
    memberId: 'EC24RC02',
    designation: 'Resource & Counselling Secretary',
    verticalSlug: 'resource-counselling',
    year: '3rd Year',
    branch: 'Information Technology'
  },
  {
    name: 'Chandra Shekar',
    phone: '9441863617',
    role: ROLES.SECRETARY,
    email: 'chandrashekar@ecell.org',
    memberId: 'EC24RC03',
    designation: 'Resource & Counselling Secretary',
    verticalSlug: 'resource-counselling',
    year: '3rd Year',
    branch: 'Mechanical'
  },

  // Marketing
  {
    name: 'Pranathi',
    phone: '7989479717',
    role: ROLES.LEAD,
    email: 'pranathi@ecell.org',
    memberId: 'EC24MKT01',
    designation: 'Marketing Lead',
    verticalSlug: 'marketing',
    year: '3rd Year',
    branch: 'Computer Science'
  },
  {
    name: 'Vyshnavi',
    phone: '8185981531',
    role: ROLES.SECRETARY,
    email: 'vyshnavi@ecell.org',
    memberId: 'EC24MKT02',
    designation: 'Marketing Secretary',
    verticalSlug: 'marketing',
    year: '3rd Year',
    branch: 'Electronics & Communication'
  },
  {
    name: 'Saraswathi',
    phone: '7702533916',
    role: ROLES.SECRETARY,
    email: 'saraswathi@ecell.org',
    memberId: 'EC24MKT03',
    designation: 'Marketing Secretary',
    verticalSlug: 'marketing',
    year: '2nd Year',
    branch: 'Information Technology'
  },

  // Media Relations
  {
    name: 'Hansi',
    phone: '7674801281',
    role: ROLES.LEAD,
    email: 'hansi@ecell.org',
    memberId: 'EC24MR01',
    designation: 'Media Relations Lead',
    verticalSlug: 'media-relations',
    year: '3rd Year',
    branch: 'Computer Science'
  },
  {
    name: 'Bhargavi',
    phone: '9494581244',
    role: ROLES.SECRETARY,
    email: 'bhargavi@ecell.org',
    memberId: 'EC24MR02',
    designation: 'Media Relations Secretary',
    verticalSlug: 'media-relations',
    year: '3rd Year',
    branch: 'Information Technology'
  },
  {
    name: 'Lakshmi Sai',
    phone: '9182250182',
    role: ROLES.SECRETARY,
    email: 'lakshmisai@ecell.org',
    memberId: 'EC24MR03',
    designation: 'Media Relations Secretary',
    verticalSlug: 'media-relations',
    year: '2nd Year',
    branch: 'Electronics'
  },

  // Finance and Logistics
  {
    name: 'Bindu',
    phone: '8712366444',
    role: ROLES.LEAD,
    email: 'bindu@ecell.org',
    memberId: 'EC24FL01',
    designation: 'Finance & Logistics Lead',
    verticalSlug: 'finance-logistics',
    year: '3rd Year',
    branch: 'Mechanical'
  },
  {
    name: 'Avinash',
    phone: '7396710313',
    role: ROLES.SECRETARY,
    email: 'avinash@ecell.org',
    memberId: 'EC24FL02',
    designation: 'Finance & Logistics Secretary',
    verticalSlug: 'finance-logistics',
    year: '3rd Year',
    branch: 'Civil'
  },
  {
    name: 'Hari Santosh Reddy',
    phone: '6303356662',
    role: ROLES.SECRETARY,
    email: 'harisantosh@ecell.org',
    memberId: 'EC24FL03',
    designation: 'Finance & Logistics Secretary',
    verticalSlug: 'finance-logistics',
    year: '2nd Year',
    branch: 'Computer Science'
  },

  // Corporate Communications
  {
    name: 'Manikanta',
    phone: '6304417066',
    role: ROLES.LEAD,
    email: 'manikanta@ecell.org',
    memberId: 'EC24CC01',
    designation: 'Corporate Communications Lead',
    verticalSlug: 'corporate-communication',
    year: '3rd Year',
    branch: 'Computer Science'
  },
  {
    name: 'Mahesh',
    phone: '6300560787',
    role: ROLES.SECRETARY,
    email: 'mahesh@ecell.org',
    memberId: 'EC24CC02',
    designation: 'Corporate Communications Secretary',
    verticalSlug: 'corporate-communication',
    year: '3rd Year',
    branch: 'Information Technology'
  },
  {
    name: 'Pradyumna',
    phone: '9557982519',
    role: ROLES.SECRETARY,
    email: 'pradyumna@ecell.org',
    memberId: 'EC24CC03',
    designation: 'Corporate Communications Secretary',
    verticalSlug: 'corporate-communication',
    year: '2nd Year',
    branch: 'Electronics'
  },

  // Creative Designing
  {
    name: 'Fathima',
    phone: '9963838500',
    role: ROLES.LEAD,
    email: 'fathima@ecell.org',
    memberId: 'EC24CD01',
    designation: 'Creative Designing Lead',
    verticalSlug: 'creative-designing',
    year: '3rd Year',
    branch: 'Computer Science'
  },
  {
    name: 'Ruchir',
    phone: '9390778081',
    role: ROLES.SECRETARY,
    email: 'ruchir@ecell.org',
    memberId: 'EC24CD02',
    designation: 'Creative Designing Secretary',
    verticalSlug: 'creative-designing',
    year: '3rd Year',
    branch: 'Information Technology'
  },
  {
    name: 'Rupa',
    phone: '9440794629',
    role: ROLES.SECRETARY,
    email: 'rupa@ecell.org',
    memberId: 'EC24CD03',
    designation: 'Creative Designing Secretary',
    verticalSlug: 'creative-designing',
    year: '2nd Year',
    branch: 'Chemical'
  },

  // Public Relations
  {
    name: 'Sri Hari Krishna',
    phone: '7671873341',
    role: ROLES.LEAD,
    email: 'sriharikrishna@ecell.org',
    memberId: 'EC24PR01',
    designation: 'Public Relations Lead',
    verticalSlug: 'public-relations',
    year: '3rd Year',
    branch: 'Computer Science'
  },
  {
    name: 'Hamsika',
    phone: '6300525600',
    role: ROLES.SECRETARY,
    email: 'hamsika@ecell.org',
    memberId: 'EC24PR02',
    designation: 'Public Relations Secretary',
    verticalSlug: 'public-relations',
    year: '3rd Year',
    branch: 'Information Technology'
  },
  {
    name: 'Pragna',
    phone: '7207293375',
    role: ROLES.SECRETARY,
    email: 'pragna@ecell.org',
    memberId: 'EC24PR03',
    designation: 'Public Relations Secretary',
    verticalSlug: 'public-relations',
    year: '2nd Year',
    branch: 'Mechanical'
  }
];

export async function setupRealCredentials() {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log(' Connected to MongoDB:', ENV.MONGO_URI);

    // 1. Ensure 7 Verticals Exist
    console.log(' Setting up 7 core verticals...');
    const verticalMap = {};
    for (const vData of DEFAULT_VERTICALS) {
      let vDoc = await Vertical.findOne({ slug: vData.slug });
      if (!vDoc) {
        vDoc = await Vertical.create({
          name: vData.name,
          slug: vData.slug,
          description: vData.description,
          isActive: true
        });
      }
      verticalMap[vData.slug] = vDoc;
    }

    // 2. Remove all existing users and dummy records
    console.log(' Clearing all dummy users, attendance, and logs...');
    await Promise.all([
      User.deleteMany({}),
      Attendance.deleteMany({}),
      EmailLog.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    // 3. Ensure Default Settings Exist
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        lowAttendanceThreshold: 75,
        minEventsForAlert: 3,
        alertCooldownDays: 7,
        autoCloseBufferMinutes: 30,
        emailAlertsEnabled: true,
        currentSession: '2026-2027',
        timezone: ENV.TIMEZONE
      });
    }

    // 4. Create Super Admin
    const defaultPassword = 'Password@123';
    const salt = await bcrypt.genSalt(12);
    const defaultPasswordHash = await bcrypt.hash(defaultPassword, salt);

    const adminSalt = await bcrypt.genSalt(12);
    const adminPasswordHash = await bcrypt.hash(ENV.ADMIN_PASSWORD || defaultPassword, adminSalt);

    const superAdmin = await User.create({
      name: ENV.ADMIN_NAME || 'Super Admin',
      email: (ENV.ADMIN_EMAIL || 'admin@ecell.org').toLowerCase(),
      memberId: (ENV.ADMIN_MEMBER_ID || 'SUPERADMIN').toUpperCase(),
      passwordHash: adminPasswordHash,
      role: ROLES.ADMIN,
      vertical: null,
      phone: '+91 98765 43210',
      year: '4th Year',
      branch: 'Administration',
      isActive: true,
      mustChangePassword: false
    });
    console.log(` Created Super Admin: ${superAdmin.email}`);

    // 5. Create Team Members
    const createdUsers = [];
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

      createdUsers.push({
        name: user.name,
        role: user.role,
        designation: member.designation,
        email: user.email,
        phone: user.phone,
        password: defaultPassword,
        memberId: user.memberId,
        vertical: vDoc ? vDoc.name : 'N/A'
      });

      // Group leads and secretaries by vertical
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

    console.log(`\n Successfully created ${createdUsers.length} official team member accounts.`);
    console.table(createdUsers.map(u => ({
      Name: u.name,
      Role: u.role,
      Designation: u.designation,
      Email: u.email,
      Phone: u.phone,
      Password: u.password,
      Vertical: u.Vertical
    })));

    await mongoose.disconnect();
    console.log(' Database disconnected. Setup complete!');
    return createdUsers;
  } catch (err) {
    console.error(' Error setting up team credentials:', err);
    process.exit(1);
  }
}

if (process.argv[1].includes('setupTeamMembers')) {
  setupRealCredentials();
}
