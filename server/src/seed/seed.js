import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Vertical } from '../models/Vertical.js';
import { Event } from '../models/Event.js';
import { Attendance } from '../models/Attendance.js';
import { Settings } from '../models/Settings.js';
import { EmailLog } from '../models/EmailLog.js';
import { AuditLog } from '../models/AuditLog.js';
import {
  ROLES,
  DEFAULT_VERTICALS,
  EVENT_STATUS,
  EVENT_TYPES,
  ATTENDANCE_STATUS,
  ATTENDANCE_SOURCE
} from '../config/constants.js';
import { ENV } from '../config/env.js';
import { TEAM_MEMBERS } from '../scripts/setupTeamMembers.js';

const isDemo = process.argv.includes('--demo');

async function seed() {
  if (isDemo && ENV.NODE_ENV === 'production') {
    console.error('❌ Refusing to run --demo seed script in PRODUCTION environment.');
    process.exit(1);
  }

  console.log(`🌱 Starting Database Seed (Demo Mode: ${isDemo ? 'ENABLED' : 'DISABLED'})...`);
  await mongoose.connect(ENV.MONGO_URI);
  console.log(' Connected to MongoDB:', ENV.MONGO_URI);

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Vertical.deleteMany({}),
    Event.deleteMany({}),
    Attendance.deleteMany({}),
    Settings.deleteMany({}),
    EmailLog.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
  console.log(' Cleared existing database records.');

  // 1. Create Default Settings
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

  // 2. Create Super Admin
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
  console.log(` Created Super Admin: ${admin.email} (Password: ${ENV.ADMIN_PASSWORD})`);

  // 3. Create 7 Verticals
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

  // 4. Create Official Team Members
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

  // Update Verticals with Assigned Leads & Secretaries
  for (const [slug, vDoc] of Object.entries(verticalMap)) {
    const leads = verticalLeads[slug] || [];
    const secs = verticalSecretaries[slug] || [];

    vDoc.leads = leads;
    vDoc.secretary = secs.length > 0 ? secs[0] : null;
    vDoc.secretaries = secs;
    await vDoc.save();
  }
  console.log(` Seeded ${allTeamUsers.length} official team members.`);

  if (!isDemo) {
    console.log('✅ Basic seed finished successfully.');
    process.exit(0);
  }

  // ================= DEMO EVENTS & ATTENDANCE =================
  console.log('🚀 Generating demo events and attendance records...');

  const pastEventsData = [
    { name: 'Annual Orientation & GBM 2024', type: 'General Body Meeting', daysAgo: 60, targetAll: true },
    { name: 'Ideation & Brainstorming Workshop', type: 'Workshop', daysAgo: 53, targetAll: true },
    { name: 'Resource & Career Counselling Meetup', type: 'Vertical Meeting', daysAgo: 45, targetAll: false },
    { name: 'Speaker Session: Startup Funding 101', type: 'Event', daysAgo: 38, targetAll: true },
    { name: 'Mid-Semester Vertical Progress Review', type: 'Vertical Meeting', daysAgo: 30, targetAll: false },
    { name: 'Hackathon Planning & Strategy Session', type: 'Workshop', daysAgo: 24, targetAll: true },
    { name: 'Corporate Outreach & Pitch Deck Sprint', type: 'Vertical Meeting', daysAgo: 17, targetAll: false },
    { name: 'Design Sprint & Branding Review', type: 'Vertical Meeting', daysAgo: 12, targetAll: false },
    { name: 'Pre-Summit All-Hands Coordination', type: 'General Body Meeting', daysAgo: 7, targetAll: true },
    { name: 'Sponsorship & Logistics Finalization', type: 'Vertical Meeting', daysAgo: 3, targetAll: false }
  ];

  const closedEvents = [];
  for (let idx = 0; idx < pastEventsData.length; idx++) {
    const item = pastEventsData[idx];
    const eventDate = new Date(Date.now() - item.daysAgo * 24 * 60 * 60 * 1000);
    const startTime = new Date(eventDate.getTime());
    startTime.setHours(17, 0, 0, 0);
    const endTime = new Date(eventDate.getTime());
    endTime.setHours(19, 0, 0, 0);

    let targetVerticals = [];
    if (!item.targetAll) {
      targetVerticals = [
        verticalDocs[idx % verticalDocs.length]._id,
        verticalDocs[(idx + 1) % verticalDocs.length]._id
      ];
    }

    const eventDoc = await Event.create({
      name: item.name,
      description: `Official E-Cell session conducted on ${eventDate.toDateString()}.`,
      type: item.type,
      date: eventDate,
      startTime,
      endTime,
      venue: item.targetAll ? 'Main Auditorium' : 'E-Cell Boardroom / Room 302',
      targetVerticals,
      status: EVENT_STATUS.CLOSED,
      manualOverride: true,
      session: '2024-2025',
      createdBy: admin._id
    });
    closedEvents.push(eventDoc);
  }
  console.log(` Created ${closedEvents.length} Past Closed Events.`);

  // Generate Attendance Records for Team Members
  const attendanceDocs = [];
  for (let eIdx = 0; eIdx < closedEvents.length; eIdx++) {
    const event = closedEvents[eIdx];
    const isTargetAll = !event.targetVerticals || event.targetVerticals.length === 0;
    const targetSet = new Set(event.targetVerticals.map((v) => v.toString()));

    for (let uIdx = 0; uIdx < allTeamUsers.length; uIdx++) {
      const user = allTeamUsers[uIdx];
      const userVerticalId = user.vertical ? user.vertical.toString() : null;

      if (!isTargetAll && (!userVerticalId || !targetSet.has(userVerticalId))) {
        continue;
      }

      const isPresent = (uIdx + eIdx) % 5 !== 0; // ~80% attendance
      attendanceDocs.push({
        event: event._id,
        member: user._id,
        vertical: user.vertical || null,
        status: isPresent ? ATTENDANCE_STATUS.PRESENT : ATTENDANCE_STATUS.ABSENT,
        source: ATTENDANCE_SOURCE.MANUAL,
        markedBy: admin._id,
        markedAt: new Date(event.date.getTime() + 45 * 60 * 1000)
      });
    }
  }

  await Attendance.insertMany(attendanceDocs);
  console.log(` Generated ${attendanceDocs.length} Attendance Records.`);

  // 6. Create Live OPEN Event
  const now = new Date();
  const openStart = new Date(now.getTime() - 15 * 60 * 1000);
  const openEnd = new Date(now.getTime() + 45 * 60 * 1000);

  const openEvent = await Event.create({
    name: 'E-Summit 2025 Core Committee Briefing',
    description: 'Crucial coordination meetup for all vertical heads and core leads.',
    type: 'General Body Meeting',
    date: now,
    startTime: openStart,
    endTime: openEnd,
    venue: 'E-Cell Innovation Center',
    targetVerticals: [],
    status: EVENT_STATUS.OPEN,
    manualOverride: false,
    session: '2024-2025',
    createdBy: admin._id
  });
  console.log(` Created Live OPEN Event: "${openEvent.name}" (Active Window).`);

  // 7. Create Upcoming Scheduled Event
  const futureDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
  const schedStart = new Date(futureDate.getTime());
  schedStart.setHours(16, 0, 0, 0);
  const schedEnd = new Date(futureDate.getTime());
  schedEnd.setHours(18, 0, 0, 0);

  const schedEvent = await Event.create({
    name: 'Startup Pitch Deck & Sponsorship Review',
    description: 'Reviewing finalist pitches and partnership collateral for summit.',
    type: 'Workshop',
    date: futureDate,
    startTime: schedStart,
    endTime: schedEnd,
    venue: 'Room 204, Tech Park',
    targetVerticals: [verticalDocs[0]._id, verticalDocs[1]._id],
    status: EVENT_STATUS.SCHEDULED,
    manualOverride: false,
    session: '2024-2025',
    createdBy: admin._id
  });
  console.log(` Created Scheduled Event: "${schedEvent.name}".`);

  console.log('\n========================================');
  console.log('✅ DATABASE SEED COMPLETE WITH REAL ROSTER!');
  console.log('========================================');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed script error:', err);
  process.exit(1);
});
