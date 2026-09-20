import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { User } from '../models/User.js';
import { Vertical } from '../models/Vertical.js';
import { Event } from '../models/Event.js';
import { Attendance } from '../models/Attendance.js';
import { Settings } from '../models/Settings.js';
import { EmailLog } from '../models/EmailLog.js';
import { attendanceService } from '../services/attendance.service.js';
import { eventService } from '../services/event.service.js';
import { alertService } from '../services/alert.service.js';
import {
  ROLES,
  EVENT_STATUS,
  ATTENDANCE_STATUS,
  ATTENDANCE_SOURCE
} from '../config/constants.js';

let mongoServer;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

test.beforeEach(async () => {
  await User.deleteMany({});
  await Vertical.deleteMany({});
  await Event.deleteMany({});
  await Attendance.deleteMany({});
  await Settings.deleteMany({});
  await EmailLog.deleteMany({});

  await Settings.create({
    lowAttendanceThreshold: 75,
    minEventsForAlert: 3,
    alertCooldownDays: 7,
    autoCloseBufferMinutes: 30,
    emailAlertsEnabled: true,
    currentSession: '2024-2025'
  });
});

test('1. Cross-Vertical Authorization: Lead of Vertical A cannot mark Vertical B members', async () => {
  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash('Password@123', salt);

  const vertA = await Vertical.create({ name: 'Vertical A', slug: 'vert-a' });
  const vertB = await Vertical.create({ name: 'Vertical B', slug: 'vert-b' });

  const leadA = await User.create({
    name: 'Lead Alpha',
    email: 'lead.a@ecell.org',
    memberId: 'LEADA01',
    passwordHash: pwd,
    role: ROLES.LEAD,
    vertical: vertA._id
  });

  const memberB = await User.create({
    name: 'Member Beta',
    email: 'mem.b@ecell.org',
    memberId: 'MEMB01',
    passwordHash: pwd,
    role: ROLES.MEMBER,
    vertical: vertB._id
  });

  const event = await Event.create({
    name: 'Cross Meeting',
    date: new Date(),
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(Date.now() + 3600000),
    status: EVENT_STATUS.OPEN,
    targetVerticals: [vertA._id, vertB._id],
    session: '2024-2025',
    createdBy: leadA._id
  });

  // Attempt to mark memberB using leadA's identity
  await assert.rejects(
    async () => {
      await attendanceService.markAttendance(
        event._id,
        {
          records: [{ memberId: memberB._id.toString(), status: ATTENDANCE_STATUS.PRESENT }]
        },
        leadA
      );
    },
    (err) => {
      assert.strictEqual(err.statusCode, 403);
      assert.match(err.message, /does not belong to your vertical/i);
      return true;
    }
  );
});

test('2. Window Enforcement: Attendance cannot be marked when event is SCHEDULED or CLOSED', async () => {
  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash('Password@123', salt);

  const vert = await Vertical.create({ name: 'Vertical X', slug: 'vert-x' });
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@ecell.org',
    memberId: 'ADMIN1',
    passwordHash: pwd,
    role: ROLES.ADMIN
  });

  const member = await User.create({
    name: 'Member X',
    email: 'mem.x@ecell.org',
    memberId: 'MEMX01',
    passwordHash: pwd,
    role: ROLES.MEMBER,
    vertical: vert._id
  });

  const scheduledEvent = await Event.create({
    name: 'Future Event',
    date: new Date(Date.now() + 86400000),
    startTime: new Date(Date.now() + 86400000),
    endTime: new Date(Date.now() + 90000000),
    status: EVENT_STATUS.SCHEDULED,
    session: '2024-2025',
    createdBy: admin._id
  });

  await assert.rejects(
    async () => {
      await attendanceService.markAttendance(
        scheduledEvent._id,
        {
          records: [{ memberId: member._id.toString(), status: ATTENDANCE_STATUS.PRESENT }]
        },
        admin
      );
    },
    (err) => {
      assert.strictEqual(err.statusCode, 400);
      assert.match(err.message, /Attendance marking is closed/i);
      return true;
    }
  );
});

test('3. Duplicate Attendance Prevention: Compound index prevents duplicate (event, member)', async () => {
  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash('Password@123', salt);

  const vert = await Vertical.create({ name: 'Vertical D', slug: 'vert-d' });
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin.d@ecell.org',
    memberId: 'ADMIND',
    passwordHash: pwd,
    role: ROLES.ADMIN
  });

  const member = await User.create({
    name: 'Member D',
    email: 'mem.d@ecell.org',
    memberId: 'MEMD01',
    passwordHash: pwd,
    role: ROLES.MEMBER,
    vertical: vert._id
  });

  const event = await Event.create({
    name: 'Duplicate Test Event',
    date: new Date(),
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(Date.now() + 3600000),
    status: EVENT_STATUS.OPEN,
    session: '2024-2025',
    createdBy: admin._id
  });

  await Attendance.create({
    event: event._id,
    member: member._id,
    vertical: vert._id,
    status: ATTENDANCE_STATUS.PRESENT,
    markedBy: admin._id,
    source: ATTENDANCE_SOURCE.MANUAL
  });

  await assert.rejects(
    async () => {
      await Attendance.create({
        event: event._id,
        member: member._id,
        vertical: vert._id,
        status: ATTENDANCE_STATUS.ABSENT,
        markedBy: admin._id,
        source: ATTENDANCE_SOURCE.MANUAL
      });
    },
    (err) => {
      assert.strictEqual(err.code, 11000); // Duplicate key error
      return true;
    }
  );
});

test('4. Percentage Calculation: Counts only closed, non-cancelled events after joinedAt targeting vertical', async () => {
  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash('Password@123', salt);

  const vertTech = await Vertical.create({ name: 'Tech', slug: 'tech' });
  const vertDesign = await Vertical.create({ name: 'Design', slug: 'design' });

  const joinedDate = new Date('2024-09-01T00:00:00.000Z');
  const member = await User.create({
    name: 'Member Rule',
    email: 'mem.rule@ecell.org',
    memberId: 'MEMRULE',
    passwordHash: pwd,
    role: ROLES.MEMBER,
    vertical: vertTech._id,
    joinedAt: joinedDate
  });

  const admin = await User.create({
    name: 'Admin',
    email: 'adm@ecell.org',
    memberId: 'ADM01',
    passwordHash: pwd,
    role: ROLES.ADMIN
  });

  // Event 1: Before joinedAt (should be excluded)
  await Event.create({
    name: 'Pre-Join Event',
    date: new Date('2024-08-15T00:00:00.000Z'),
    startTime: new Date('2024-08-15T00:00:00.000Z'),
    endTime: new Date('2024-08-15T02:00:00.000Z'),
    status: EVENT_STATUS.CLOSED,
    targetVerticals: [vertTech._id],
    session: '2024-2025',
    createdBy: admin._id
  });

  // Event 2: Cancelled event (should be excluded)
  await Event.create({
    name: 'Cancelled Event',
    date: new Date('2024-09-10T00:00:00.000Z'),
    startTime: new Date('2024-09-10T00:00:00.000Z'),
    endTime: new Date('2024-09-10T02:00:00.000Z'),
    status: EVENT_STATUS.CANCELLED,
    targetVerticals: [vertTech._id],
    session: '2024-2025',
    createdBy: admin._id
  });

  // Event 3: Targets only Design vertical (should be excluded for Tech member)
  await Event.create({
    name: 'Design Only Event',
    date: new Date('2024-09-12T00:00:00.000Z'),
    startTime: new Date('2024-09-12T00:00:00.000Z'),
    endTime: new Date('2024-09-12T02:00:00.000Z'),
    status: EVENT_STATUS.CLOSED,
    targetVerticals: [vertDesign._id],
    session: '2024-2025',
    createdBy: admin._id
  });

  // Event 4: Valid closed event targeting Tech -> Present
  const ev4 = await Event.create({
    name: 'Tech Event 1',
    date: new Date('2024-09-15T00:00:00.000Z'),
    startTime: new Date('2024-09-15T00:00:00.000Z'),
    endTime: new Date('2024-09-15T02:00:00.000Z'),
    status: EVENT_STATUS.CLOSED,
    targetVerticals: [vertTech._id],
    session: '2024-2025',
    createdBy: admin._id
  });
  await Attendance.create({
    event: ev4._id,
    member: member._id,
    vertical: vertTech._id,
    status: ATTENDANCE_STATUS.PRESENT,
    markedBy: admin._id
  });

  // Event 5: Valid closed event targeting All verticals -> Absent
  const ev5 = await Event.create({
    name: 'All Hands Event',
    date: new Date('2024-09-20T00:00:00.000Z'),
    startTime: new Date('2024-09-20T00:00:00.000Z'),
    endTime: new Date('2024-09-20T02:00:00.000Z'),
    status: EVENT_STATUS.CLOSED,
    targetVerticals: [], // All verticals
    session: '2024-2025',
    createdBy: admin._id
  });
  await Attendance.create({
    event: ev5._id,
    member: member._id,
    vertical: vertTech._id,
    status: ATTENDANCE_STATUS.ABSENT,
    markedBy: admin._id
  });

  const stats = await alertService.calculateMemberAttendance(member._id, '2024-2025');

  // Should have exactly 2 eligible events, 1 present => 50%
  assert.strictEqual(stats.eligibleCount, 2);
  assert.strictEqual(stats.attendedCount, 1);
  assert.strictEqual(stats.absentCount, 1);
  assert.strictEqual(stats.percentage, 50);
});

test('5. Event Close Automation: Auto-marks absent for unmarked members and evaluates alerts', async () => {
  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash('Password@123', salt);

  const vert = await Vertical.create({ name: 'Marketing', slug: 'marketing' });
  const admin = await User.create({
    name: 'Admin',
    email: 'admin.m@ecell.org',
    memberId: 'ADMMKT',
    passwordHash: pwd,
    role: ROLES.ADMIN
  });

  const member1 = await User.create({
    name: 'Present Member',
    email: 'pres@ecell.org',
    memberId: 'MEMP01',
    passwordHash: pwd,
    role: ROLES.MEMBER,
    vertical: vert._id
  });

  const member2 = await User.create({
    name: 'Unmarked Member',
    email: 'unmarked@ecell.org',
    memberId: 'MEMU01',
    passwordHash: pwd,
    role: ROLES.MEMBER,
    vertical: vert._id
  });

  const event = await Event.create({
    name: 'Marketing Workshop',
    date: new Date(),
    startTime: new Date(Date.now() - 7200000),
    endTime: new Date(Date.now() - 3600000),
    status: EVENT_STATUS.OPEN,
    targetVerticals: [vert._id],
    session: '2024-2025',
    createdBy: admin._id
  });

  // Mark member1 as PRESENT
  await Attendance.create({
    event: event._id,
    member: member1._id,
    vertical: vert._id,
    status: ATTENDANCE_STATUS.PRESENT,
    markedBy: admin._id,
    source: ATTENDANCE_SOURCE.MANUAL
  });

  // Now close the event using eventService.closeEvent
  await eventService.closeEvent(event._id, admin);

  // Check member2's auto-generated record
  const autoRecord = await Attendance.findOne({ event: event._id, member: member2._id });
  assert.ok(autoRecord, 'Auto-absent record should exist for unmarked member');
  assert.strictEqual(autoRecord.status, ATTENDANCE_STATUS.ABSENT);
  assert.strictEqual(autoRecord.source, ATTENDANCE_SOURCE.AUTO);
});

test('6. Leadership Exclusion: Leads, Secretaries, and Admins are excluded from attendance roster and auto-absents', async () => {
  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash('Password@123', salt);

  const vert = await Vertical.create({ name: 'Creative Designing', slug: 'creative-designing' });

  // 1 Lead, 1 Secretary, 1 Admin, 2 Members
  const lead = await User.create({
    name: 'Design Lead',
    email: 'lead.design@ecell.org',
    memberId: 'LEADDES01',
    passwordHash: pwd,
    role: ROLES.LEAD,
    vertical: vert._id
  });

  const sec = await User.create({
    name: 'Design Secretary',
    email: 'sec.design@ecell.org',
    memberId: 'SECDES01',
    passwordHash: pwd,
    role: ROLES.SECRETARY,
    vertical: vert._id
  });

  const member1 = await User.create({
    name: 'Member First',
    email: 'mem1@gmail.com',
    memberId: 'ECELL_001',
    passwordHash: pwd,
    role: ROLES.MEMBER,
    vertical: vert._id
  });

  const member2 = await User.create({
    name: 'Member Second',
    email: 'mem2@gmail.com',
    memberId: 'ECELL_002',
    passwordHash: pwd,
    role: ROLES.MEMBER,
    vertical: vert._id
  });

  const event = await Event.create({
    name: 'Design Sprint',
    date: new Date(),
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(Date.now() + 3600000),
    status: EVENT_STATUS.OPEN,
    targetVerticals: [vert._id],
    session: '2024-2025',
    createdBy: lead._id
  });

  // Verify getEventRoster returns ONLY regular members
  const rosterResult = await attendanceService.getEventRoster(event._id, { verticalId: vert._id.toString(), user: lead });
  assert.strictEqual(rosterResult.totalMembers, 2);
  const rosterMemberEmails = rosterResult.roster.map((r) => r.member.email);
  assert.ok(rosterMemberEmails.includes('mem1@gmail.com'));
  assert.ok(rosterMemberEmails.includes('mem2@gmail.com'));
  assert.ok(!rosterMemberEmails.includes('lead.design@ecell.org'), 'Lead should not be in attendance roster');
  assert.ok(!rosterMemberEmails.includes('sec.design@ecell.org'), 'Secretary should not be in attendance roster');

  // Mark member1 PRESENT and close event
  await attendanceService.markAttendance(
    event._id,
    { records: [{ memberId: member1._id.toString(), status: ATTENDANCE_STATUS.PRESENT }] },
    lead
  );

  await eventService.closeEvent(event._id, lead);

  // Auto-absent records must only exist for member2, NEVER for lead or secretary
  const leadAtt = await Attendance.findOne({ event: event._id, member: lead._id });
  const secAtt = await Attendance.findOne({ event: event._id, member: sec._id });
  const mem2Att = await Attendance.findOne({ event: event._id, member: member2._id });

  assert.strictEqual(leadAtt, null, 'No attendance record should exist for Lead');
  assert.strictEqual(secAtt, null, 'No attendance record should exist for Secretary');
  assert.ok(mem2Att, 'Auto-absent record should exist for Member 2');
  assert.strictEqual(mem2Att.status, ATTENDANCE_STATUS.ABSENT);
});

