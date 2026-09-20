import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { Settings } from '../models/Settings.js';
import { alertService } from './alert.service.js';
import { auditService } from './audit.service.js';
import { EVENT_STATUS, ATTENDANCE_STATUS, ATTENDANCE_SOURCE, AUDIT_ACTIONS, ROLES } from '../config/constants.js';
import { toUTCDate } from '../utils/dateUtils.js';

class EventService {
  async createEvent(eventData, actor = null, ip = '') {
    const settings = await Settings.getSettings();
    const session = eventData.session || settings.currentSession;

    const event = await Event.create({
      name: eventData.name,
      description: eventData.description || '',
      type: eventData.type || 'Event',
      date: toUTCDate(eventData.date),
      startTime: toUTCDate(eventData.startTime),
      endTime: toUTCDate(eventData.endTime),
      venue: eventData.venue || 'E-Cell Hall / Virtual',
      targetVerticals: eventData.targetVerticals || [],
      status: EVENT_STATUS.SCHEDULED,
      manualOverride: false,
      session,
      createdBy: actor?._id || actor
    });

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'Event',
      entityId: event._id,
      after: event.toObject(),
      reason: 'Admin scheduled new event',
      ip
    });

    return Event.findById(event._id)
      .populate('targetVerticals', 'name slug')
      .populate('createdBy', 'name email');
  }

  async updateEvent(id, updateData, actor = null, ip = '') {
    const event = await Event.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }

    const before = event.toObject();

    if (updateData.name) event.name = updateData.name;
    if (updateData.description !== undefined) event.description = updateData.description;
    if (updateData.type) event.type = updateData.type;
    if (updateData.date) event.date = toUTCDate(updateData.date);
    if (updateData.startTime) event.startTime = toUTCDate(updateData.startTime);
    if (updateData.endTime) event.endTime = toUTCDate(updateData.endTime);
    if (updateData.venue !== undefined) event.venue = updateData.venue;
    if (updateData.targetVerticals !== undefined) event.targetVerticals = updateData.targetVerticals;
    if (updateData.session) event.session = updateData.session;

    await event.save();

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'Event',
      entityId: event._id,
      before,
      after: event.toObject(),
      reason: 'Admin updated event details',
      ip
    });

    return Event.findById(event._id)
      .populate('targetVerticals', 'name slug')
      .populate('createdBy', 'name email');
  }

  async getEventById(id) {
    const event = await Event.findById(id)
      .populate('targetVerticals', 'name slug')
      .populate('createdBy', 'name email');

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  async listEvents({
    page = 1,
    limit = 20,
    status,
    vertical,
    session,
    type,
    search,
    sortBy = 'startTime',
    sortOrder = 'desc'
  }) {
    const query = {};

    if (status) {
      query.status = status;
    }

    if (session) {
      query.session = session;
    }

    if (type) {
      query.type = type;
    }

    if (vertical) {
      query.$or = [
        { targetVerticals: { $size: 0 } },
        { targetVerticals: vertical }
      ];
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('targetVerticals', 'name slug')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Event.countDocuments(query)
    ]);

    return {
      events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async openEvent(id, actor = null, ip = '') {
    const event = await Event.findById(id);
    if (!event) throw new Error('Event not found');

    if (event.status === EVENT_STATUS.CANCELLED) {
      throw new Error('Cannot open a cancelled event');
    }

    const before = event.toObject();
    event.status = EVENT_STATUS.OPEN;
    event.manualOverride = true;
    await event.save();

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.STATUS_CHANGE,
      entityType: 'Event',
      entityId: event._id,
      before,
      after: event.toObject(),
      reason: 'Admin manually opened event attendance window',
      ip
    });

    return event;
  }

  async reopenEvent(id, actor = null, ip = '') {
    const event = await Event.findById(id);
    if (!event) throw new Error('Event not found');

    const before = event.toObject();
    event.status = EVENT_STATUS.OPEN;
    event.manualOverride = true;
    await event.save();

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.STATUS_CHANGE,
      entityType: 'Event',
      entityId: event._id,
      before,
      after: event.toObject(),
      reason: 'Admin manually reopened event attendance window',
      ip
    });

    return event;
  }

  async closeEvent(id, actor = null, ip = '') {
    // Atomic status transition so closing, absent-fill and alerts happen exactly once
    const event = await Event.findOneAndUpdate(
      { _id: id, status: { $ne: EVENT_STATUS.CLOSED } },
      { $set: { status: EVENT_STATUS.CLOSED, manualOverride: true } },
      { new: true }
    );

    if (!event) {
      const existing = await Event.findById(id);
      if (!existing) throw new Error('Event not found');
      return existing; // Already closed
    }

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.STATUS_CHANGE,
      entityType: 'Event',
      entityId: event._id,
      after: event.toObject(),
      reason: 'Admin manually closed event attendance window',
      ip
    });

    // Finalize absent records & trigger alerts
    await this.finalizeEventAbsentsAndAlerts(event);

    return event;
  }

  async cancelEvent(id, actor = null, ip = '') {
    const event = await Event.findById(id);
    if (!event) throw new Error('Event not found');

    const before = event.toObject();
    event.status = EVENT_STATUS.CANCELLED;
    event.manualOverride = true;
    await event.save();

    await auditService.log({
      actor: actor?._id || actor,
      action: AUDIT_ACTIONS.STATUS_CHANGE,
      entityType: 'Event',
      entityId: event._id,
      before,
      after: event.toObject(),
      reason: 'Admin cancelled event',
      ip
    });

    return event;
  }

  /**
   * Finalizes absent records for all targeted active members who were not marked,
   * then evaluates low-attendance alerts.
   */
  async finalizeEventAbsentsAndAlerts(event) {
    try {
      const memberQuery = {
        role: ROLES.MEMBER,
        isActive: true,
        joinedAt: { $lte: event.date || event.startTime }
      };

      if (event.targetVerticals && event.targetVerticals.length > 0) {
        memberQuery.vertical = { $in: event.targetVerticals };
      }

      const eligibleMembers = await User.find(memberQuery);
      const existingRecords = await Attendance.find({ event: event._id });
      const markedMemberIds = new Set(existingRecords.map((r) => r.member.toString()));

      const absentDocs = [];
      for (const member of eligibleMembers) {
        if (!markedMemberIds.has(member._id.toString())) {
          absentDocs.push({
            event: event._id,
            member: member._id,
            vertical: member.vertical || null,
            status: ATTENDANCE_STATUS.ABSENT,
            markedBy: null,
            markedAt: new Date(),
            source: ATTENDANCE_SOURCE.AUTO,
            remarks: 'Auto-marked absent on event closure'
          });
        }
      }

      if (absentDocs.length > 0) {
        // Use bulk write / insertMany with ordered: false to safely ignore duplicate conflicts
        try {
          await Attendance.insertMany(absentDocs, { ordered: false });
        } catch (insertErr) {
          // Ignore duplicate key errors if any race condition occurred
        }
        console.log(`[EventService] Finalized ${absentDocs.length} auto-absent records for event "${event.name}"`);
      }

      // Trigger low-attendance alerts
      await alertService.evaluateAndSendAlertsForClosedEvent(event);
    } catch (err) {
      console.error('[EventService] Error finalizing absents and alerts:', err.message);
    }
  }
}

export const eventService = new EventService();
