import { Attendance } from '../models/Attendance.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { auditService } from './audit.service.js';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_SOURCE,
  EVENT_STATUS,
  ROLES,
  AUDIT_ACTIONS
} from '../config/constants.js';

class AttendanceService {
  /**
   * Retrieves the member roster for an event with existing attendance records.
   */
  async getEventRoster(eventId, { verticalId = null, user }) {
    const event = await Event.findById(eventId).populate('targetVerticals');
    if (!event) {
      throw new Error('Event not found');
    }

    // Determine target vertical restriction
    let targetVerticalId = verticalId;
    if (user.role === ROLES.SECRETARY || user.role === ROLES.LEAD) {
      if (!user.vertical) {
        throw new Error('User is not assigned to any vertical');
      }
      targetVerticalId = user.vertical._id ? user.vertical._id.toString() : user.vertical.toString();

      // Ensure the event actually targets this vertical
      if (
        event.targetVerticals &&
        event.targetVerticals.length > 0 &&
        !event.targetVerticals.some((v) => v._id.toString() === targetVerticalId)
      ) {
        const error = new Error('This event does not target your vertical');
        error.statusCode = 403;
        throw error;
      }
    }

    const memberQuery = {
      isActive: true,
      joinedAt: { $lte: event.date || event.startTime }
    };

    if (targetVerticalId) {
      memberQuery.vertical = targetVerticalId;
    } else if (event.targetVerticals && event.targetVerticals.length > 0) {
      memberQuery.vertical = { $in: event.targetVerticals.map((v) => v._id) };
    }

    const [members, existingAttendance] = await Promise.all([
      User.find(memberQuery).populate('vertical', 'name slug').sort({ name: 1 }),
      Attendance.find({ event: event._id }).populate('markedBy', 'name email')
    ]);

    const attendanceMap = new Map();
    existingAttendance.forEach((att) => {
      attendanceMap.set(att.member.toString(), att);
    });

    const roster = members.map((member) => {
      const record = attendanceMap.get(member._id.toString());
      return {
        member: {
          _id: member._id,
          name: member.name,
          email: member.email,
          memberId: member.memberId,
          role: member.role,
          vertical: member.vertical
        },
        attendanceId: record ? record._id : null,
        status: record ? record.status : null,
        source: record ? record.source : null,
        markedAt: record ? record.markedAt : null,
        markedBy: record && record.markedBy ? { _id: record.markedBy._id, name: record.markedBy.name } : null,
        remarks: record ? record.remarks : ''
      };
    });

    return {
      event: {
        _id: event._id,
        name: event.name,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        status: event.status,
        venue: event.venue
      },
      verticalId: targetVerticalId,
      totalMembers: roster.length,
      presentCount: roster.filter((r) => r.status === ATTENDANCE_STATUS.PRESENT).length,
      absentCount: roster.filter((r) => r.status === ATTENDANCE_STATUS.ABSENT).length,
      roster
    };
  }

  /**
   * Bulk marks/upserts attendance for an OPEN event.
   */
  async markAttendance(eventId, { records, verticalId }, user, ip = '') {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Window enforcement: only OPEN events can be marked by heads/admin via roster
    if (event.status !== EVENT_STATUS.OPEN) {
      const error = new Error(`Attendance marking is closed for this event. Current status: ${event.status}`);
      error.statusCode = 400;
      throw error;
    }

    // Role-based vertical scope enforcement
    let enforcedVerticalId = verticalId;
    if (user.role === ROLES.SECRETARY || user.role === ROLES.LEAD) {
      enforcedVerticalId = user.vertical?._id ? user.vertical._id.toString() : user.vertical?.toString();
      if (!enforcedVerticalId) {
        const error = new Error('You are not assigned to a vertical');
        error.statusCode = 403;
        throw error;
      }
    }

    const memberIds = records.map((r) => r.memberId);
    const members = await User.find({ _id: { $in: memberIds } });
    const memberMap = new Map();
    members.forEach((m) => memberMap.set(m._id.toString(), m));

    // Verify all members belong to the vertical if user is SECRETARY or LEAD
    if (user.role === ROLES.SECRETARY || user.role === ROLES.LEAD) {
      for (const m of members) {
        const mVert = m.vertical ? m.vertical.toString() : null;
        if (mVert !== enforcedVerticalId) {
          const error = new Error(`Access denied: Member ${m.name} (${m.memberId}) does not belong to your vertical.`);
          error.statusCode = 403;
          throw error;
        }
      }
    }

    const bulkOps = records.map((rec) => {
      const memberDoc = memberMap.get(rec.memberId);
      const vId = memberDoc ? memberDoc.vertical : enforcedVerticalId;

      return {
        updateOne: {
          filter: { event: event._id, member: rec.memberId },
          update: {
            $set: {
              event: event._id,
              member: rec.memberId,
              vertical: vId,
              status: rec.status,
              markedBy: user._id,
              markedAt: new Date(),
              source: ATTENDANCE_SOURCE.MANUAL,
              remarks: rec.remarks || ''
            }
          },
          upsert: true
        }
      };
    });

    const result = await Attendance.bulkWrite(bulkOps);

    await auditService.log({
      actor: user._id,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'Attendance',
      entityId: event._id,
      reason: `Bulk marked attendance for ${records.length} members by ${user.name} (${user.role})`,
      ip
    });

    return {
      message: 'Attendance saved successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    };
  }

  /**
   * Admin edit of an individual attendance record with mandatory reason & audit log.
   */
  async adminEditAttendance(attendanceId, { status, reason, remarks }, user, ip = '') {
    if (!reason || reason.trim().length < 5) {
      throw new Error('A detailed reason (at least 5 characters) is required for admin attendance override.');
    }

    const attendance = await Attendance.findById(attendanceId)
      .populate('member', 'name email memberId')
      .populate('event', 'name date');

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    const before = attendance.toObject();

    attendance.status = status;
    attendance.source = ATTENDANCE_SOURCE.ADMIN_EDIT;
    attendance.remarks = remarks || `Admin edit by ${user.name}: ${reason}`;
    attendance.markedBy = user._id;
    attendance.markedAt = new Date();
    await attendance.save();

    await auditService.log({
      actor: user._id,
      action: AUDIT_ACTIONS.ATTENDANCE_OVERRIDE,
      entityType: 'Attendance',
      entityId: attendance._id,
      before,
      after: attendance.toObject(),
      reason,
      ip
    });

    return attendance;
  }

  /**
   * Admin oversight list of all attendance records.
   */
  async listAttendanceRecords({
    page = 1,
    limit = 20,
    eventId,
    verticalId,
    memberId,
    status,
    startDate,
    endDate
  }) {
    const query = {};

    if (eventId) query.event = eventId;
    if (verticalId) query.vertical = verticalId;
    if (memberId) query.member = memberId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.markedAt = {};
      if (startDate) query.markedAt.$gte = new Date(startDate);
      if (endDate) query.markedAt.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate('member', 'name email memberId role')
        .populate('event', 'name date session type')
        .populate('vertical', 'name slug')
        .populate('markedBy', 'name email')
        .sort({ markedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Attendance.countDocuments(query)
    ]);

    return {
      records,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }
}

export const attendanceService = new AttendanceService();
