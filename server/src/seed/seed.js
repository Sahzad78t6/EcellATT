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

  // 3. Create 8 Verticals
  const verticalDocs = [];
  for (const vData of DEFAULT_VERTICALS) {
    const vDoc = await Vertical.create({
      name: vData.name,
      slug: vData.slug,
      description: vData.description,
      isActive: true
    });
    verticalDocs.push(vDoc);
  }
  console.log(` Seeded ${verticalDocs.length} Core Verticals.`);

  if (!isDemo) {
    console.log('✅ Basic seed finished successfully.');
    process.exit(0);
  }

  // ================= DEMO DATA GENERATION =================
  console.log('🚀 Generating rich demo data for all roles and dashboards...');

  const defaultPassword = 'Password@123';
  const salt = await bcrypt.genSalt(12);
  const demoPasswordHash = await bcrypt.hash(defaultPassword, salt);

  const allMembers = [];
  const allHeads = [];

  const firstNames = [
    'Aarav', 'Ananya', 'Rohan', 'Sneha', 'Vikram', 'Pooja', 'Karan', 'Isha',
    'Aditya', 'Meera', 'Kabir', 'Rhea', 'Arjun', 'Tanvi', 'Siddharth', 'Divya',
    'Rahul', 'Neha', 'Varun', 'Shreya', 'Manish', 'Kavya', 'Nikhil', 'Simran'
  ];
  const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Reddy', 'Gupta', 'Mehta', 'Chopra', 'Nair',
    'Singh', 'Joshi', 'Bhatia', 'Malhotra', 'Kapoor', 'Saxena', 'Deshmukh', 'Das'
  ];
  const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Chemical', 'Civil'];
  const years = ['1st Year', '2nd Year', '3rd Year'];

  let memberCounter = 101;

  for (let i = 0; i < verticalDocs.length; i++) {
    const vertical = verticalDocs[i];
    const vSlug = vertical.slug.replace(/-/g, '.');

    // 1 Secretary per vertical
    const secName = `${firstNames[(i * 2) % firstNames.length]} ${lastNames[(i * 2) % lastNames.length]}`;
    const secretary = await User.create({
      name: secName,
      email: `${vSlug}.sec@ecell.org`,
      memberId: `SEC${String(i + 1).padStart(3, '0')}`,
      passwordHash: demoPasswordHash,
      role: ROLES.SECRETARY,
      vertical: vertical._id,
      phone: `+91 98123 ${10000 + i}`,
      year: '3rd Year',
      branch: branches[i % branches.length],
      isActive: true,
      mustChangePassword: false,
      joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    });
    vertical.secretary = secretary._id;
    allHeads.push(secretary);

    // 1 Lead per vertical
    const leadName = `${firstNames[(i * 2 + 1) % firstNames.length]} ${lastNames[(i * 2 + 1) % lastNames.length]}`;
    const lead = await User.create({
      name: leadName,
      email: `${vSlug}.lead@ecell.org`,
      memberId: `LEAD${String(i + 1).padStart(3, '0')}`,
      passwordHash: demoPasswordHash,
      role: ROLES.LEAD,
      vertical: vertical._id,
      phone: `+91 98321 ${20000 + i}`,
      year: '2nd Year',
      branch: branches[(i + 1) % branches.length],
      isActive: true,
      mustChangePassword: false,
      joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    });
    vertical.leads = [lead._id];
    allHeads.push(lead);

    await vertical.save();

    // 8 Members per vertical
    for (let m = 0; m < 8; m++) {
      const fn = firstNames[(i * 8 + m) % firstNames.length];
      const ln = lastNames[(i * 8 + m) % lastNames.length];
      const mEmail = `member.${vertical.slug.substring(0, 4)}.${m + 1}@ecell.org`;
      const mem = await User.create({
        name: `${fn} ${ln}`,
        email: mEmail,
        memberId: `EC24${memberCounter++}`,
        passwordHash: demoPasswordHash,
        role: ROLES.MEMBER,
        vertical: vertical._id,
        phone: `+91 97000 ${30000 + memberCounter}`,
        year: years[m % years.length],
        branch: branches[m % branches.length],
        isActive: true,
        mustChangePassword: false,
        joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
      });
      allMembers.push(mem);
    }
  }

  console.log(` Created ${allHeads.length} Vertical Heads (Secretaries & Leads) and ${allMembers.length} Members.`);

  // 4. Create 10 Past Closed Events
  const pastEventsData = [
    { name: 'Annual Orientation & GBM 2024', type: 'General Body Meeting', daysAgo: 60, targetAll: true },
    { name: 'Ideation & Brainstorming Workshop', type: 'Workshop', daysAgo: 53, targetAll: true },
    { name: 'Vertical Alignment & Roadmap Meeting', type: 'Vertical Meeting', daysAgo: 45, targetAll: false },
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
      // Pick 2-4 verticals for targeted meetings
      targetVerticals = [
        verticalDocs[idx % verticalDocs.length]._id,
        verticalDocs[(idx + 1) % verticalDocs.length]._id,
        verticalDocs[(idx + 2) % verticalDocs.length]._id
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

  // 5. Generate Realistic Attendance Records
  const attendanceDocs = [];
  const allParticipants = [...allHeads, ...allMembers];

  for (let eIdx = 0; eIdx < closedEvents.length; eIdx++) {
    const event = closedEvents[eIdx];
    const isTargetAll = !event.targetVerticals || event.targetVerticals.length === 0;
    const targetSet = new Set(event.targetVerticals.map((v) => v.toString()));

    for (let uIdx = 0; uIdx < allParticipants.length; uIdx++) {
      const user = allParticipants[uIdx];
      const userVerticalId = user.vertical ? user.vertical.toString() : null;

      if (!isTargetAll && (!userVerticalId || !targetSet.has(userVerticalId))) {
        continue; // Not eligible for this event
      }

      // Member attendance probability (some members deliberately below 75% for at-risk demos)
      let presentProbability = 0.85;
      if (uIdx % 5 === 0) {
        // Deliberately low attendance (around 40-50%)
        presentProbability = 0.40;
      } else if (uIdx % 7 === 0) {
        // Borderline attendance (around 65%)
        presentProbability = 0.65;
      } else if (user.role === ROLES.SECRETARY || user.role === ROLES.LEAD) {
        // High attendance for heads
        presentProbability = 0.95;
      }

      const isPresent = Math.random() < presentProbability;
      attendanceDocs.push({
        event: event._id,
        member: user._id,
        vertical: user.vertical,
        status: isPresent ? ATTENDANCE_STATUS.PRESENT : ATTENDANCE_STATUS.ABSENT,
        markedBy: admin._id,
        markedAt: event.endTime,
        source: ATTENDANCE_SOURCE.MANUAL,
        remarks: isPresent ? '' : 'Absent during roll call'
      });
    }
  }

  await Attendance.insertMany(attendanceDocs);
  console.log(` Seeded ${attendanceDocs.length} realistic attendance records.`);

  // 6. Create 2 Upcoming / Live Events
  const liveStartTime = new Date(Date.now() - 30 * 60 * 1000); // started 30 mins ago
  const liveEndTime = new Date(Date.now() + 60 * 60 * 1000); // ends in 60 mins
  const liveEvent = await Event.create({
    name: 'E-Summit 2025 Core Committee Briefing',
    description: 'Attendance window is currently OPEN. Heads must mark member attendance.',
    type: 'Event',
    date: new Date(),
    startTime: liveStartTime,
    endTime: liveEndTime,
    venue: 'Innovation Hub & Online',
    targetVerticals: [], // All verticals
    status: EVENT_STATUS.OPEN,
    manualOverride: true,
    session: '2024-2025',
    createdBy: admin._id
  });

  const futureDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
  const futureStartTime = new Date(futureDate.getTime());
  futureStartTime.setHours(18, 0, 0, 0);
  const futureEndTime = new Date(futureDate.getTime());
  futureEndTime.setHours(20, 0, 0, 0);
  const upcomingEvent = await Event.create({
    name: 'National Venture Challenge Kickoff',
    description: 'Upcoming scheduled workshop and kickoff meeting.',
    type: 'Workshop',
    date: futureDate,
    startTime: futureStartTime,
    endTime: futureEndTime,
    venue: 'Seminar Hall B',
    targetVerticals: [verticalDocs[0]._id, verticalDocs[1]._id], // Creative & Technical
    status: EVENT_STATUS.SCHEDULED,
    manualOverride: false,
    session: '2024-2025',
    createdBy: admin._id
  });

  console.log(` Created 1 OPEN Live Event ("${liveEvent.name}") and 1 Scheduled Upcoming Event ("${upcomingEvent.name}").`);

  // 7. Seed Initial Audit Logs
  await AuditLog.create([
    {
      actor: admin._id,
      action: 'SYSTEM_SEED',
      entityType: 'System',
      entityId: 'ROOT',
      reason: 'Initialized complete database schema and seed data',
      ip: '127.0.0.1',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      actor: admin._id,
      action: 'SETTINGS_UPDATE',
      entityType: 'Settings',
      entityId: settings._id.toString(),
      reason: 'Configured attendance threshold to 75%',
      ip: '127.0.0.1',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    }
  ]);

  console.log(' Seeded initial audit logs.');
  console.log('========================================================================');
  console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
  console.log('------------------------------------------------------------------------');
  console.log(`👑 ADMIN LOGIN:     ${ENV.ADMIN_EMAIL} / ${ENV.ADMIN_PASSWORD}`);
  console.log(`👔 TECH HEAD LOGIN:  technical.lead@ecell.org / ${defaultPassword}`);
  console.log(`👔 TECH SEC LOGIN:   technical.sec@ecell.org / ${defaultPassword}`);
  console.log(`👤 MEMBER LOGIN:    member.tech.1@ecell.org / ${defaultPassword}`);
  console.log('========================================================================');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed execution failed:', err);
  process.exit(1);
});
