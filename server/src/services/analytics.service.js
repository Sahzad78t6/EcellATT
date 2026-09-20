import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Attendance } from '../models/Attendance.js';
import { Vertical } from '../models/Vertical.js';
import { Settings } from '../models/Settings.js';
import { EVENT_STATUS, ATTENDANCE_STATUS, ROLES } from '../config/constants.js';

class AnalyticsService {
  /**
   * Helper to fetch active session settings
   */
  async getEffectiveSession(session) {
    if (session) return session;
    const settings = await Settings.getSettings();
    return settings.currentSession;
  }

  /**
   * ADMIN: System-wide Overview KPI Metrics
   */
  async getAdminOverview(sessionFilter) {
    const session = await this.getEffectiveSession(sessionFilter);
    const settings = await Settings.getSettings();

    const [totalMembers, totalEvents, closedEvents, upcomingEvents] = await Promise.all([
      User.countDocuments({ role: ROLES.MEMBER, isActive: true }),
      Event.countDocuments({ session }),
      Event.find({ session, status: EVENT_STATUS.CLOSED }),
      Event.find({
        session,
        status: { $in: [EVENT_STATUS.SCHEDULED, EVENT_STATUS.OPEN] }
      }).populate('targetVerticals', 'name').sort({ startTime: 1 }).limit(5)
    ]);

    const closedEventIds = closedEvents.map((e) => e._id);

    let overallAttendancePercent = 0;
    if (closedEventIds.length > 0) {
      const attendanceStats = await Attendance.aggregate([
        { $match: { event: { $in: closedEventIds } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const present = attendanceStats.find((s) => s._id === ATTENDANCE_STATUS.PRESENT)?.count || 0;
      const absent = attendanceStats.find((s) => s._id === ATTENDANCE_STATUS.ABSENT)?.count || 0;
      const totalMarks = present + absent;
      overallAttendancePercent = totalMarks > 0 ? Number(((present / totalMarks) * 100).toFixed(1)) : 0;
    }

    // Calculate members below threshold
    const atRiskList = await this.getAtRiskMembers(session);

    return {
      session,
      totalMembers,
      totalEvents,
      closedEventsCount: closedEvents.length,
      overallAttendancePercent,
      membersBelowThresholdCount: atRiskList.length,
      threshold: settings.lowAttendanceThreshold,
      upcomingEvents
    };
  }

  /**
   * ADMIN: Attendance Trends Over Time (Overall or by Vertical)
   */
  async getAttendanceTrends(sessionFilter, verticalId = null) {
    const session = await this.getEffectiveSession(sessionFilter);

    const eventMatch = { session, status: EVENT_STATUS.CLOSED };
    if (verticalId) {
      const vObjectId = new mongoose.Types.ObjectId(verticalId);
      eventMatch.$or = [{ targetVerticals: { $size: 0 } }, { targetVerticals: vObjectId }];
    }

    const closedEvents = await Event.find(eventMatch).sort({ date: 1, startTime: 1 });
    if (closedEvents.length === 0) {
      return [];
    }

    const eventIds = closedEvents.map((e) => e._id);
    const attMatch = { event: { $in: eventIds } };
    if (verticalId) {
      attMatch.vertical = new mongoose.Types.ObjectId(verticalId);
    }

    const stats = await Attendance.aggregate([
      { $match: attMatch },
      {
        $group: {
          _id: {
            event: '$event',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const eventStatsMap = new Map();
    stats.forEach((s) => {
      const eId = s._id.event.toString();
      if (!eventStatsMap.has(eId)) {
        eventStatsMap.set(eId, { present: 0, absent: 0 });
      }
      if (s._id.status === ATTENDANCE_STATUS.PRESENT) {
        eventStatsMap.get(eId).present = s.count;
      } else if (s._id.status === ATTENDANCE_STATUS.ABSENT) {
        eventStatsMap.get(eId).absent = s.count;
      }
    });

    return closedEvents.map((e) => {
      const eData = eventStatsMap.get(e._id.toString()) || { present: 0, absent: 0 };
      const total = eData.present + eData.absent;
      const percentage = total > 0 ? Number(((eData.present / total) * 100).toFixed(1)) : 0;
      return {
        eventId: e._id,
        name: e.name,
        type: e.type,
        date: e.date,
        present: eData.present,
        absent: eData.absent,
        total,
        percentage
      };
    });
  }

  /**
   * ADMIN: Cross-Vertical Comparison Bar Chart Data
   */
  async getVerticalComparison(sessionFilter) {
    const session = await this.getEffectiveSession(sessionFilter);
    const verticals = await Vertical.find({ isActive: true }).sort({ name: 1 });
    const closedEvents = await Event.find({ session, status: EVENT_STATUS.CLOSED });
    const closedEventIds = closedEvents.map((e) => e._id);

    if (closedEventIds.length === 0) {
      return verticals.map((v) => ({
        verticalId: v._id,
        name: v.name,
        slug: v.slug,
        memberCount: 0,
        averageAttendance: 0,
        totalPresent: 0,
        totalRecords: 0
      }));
    }

    const attendanceByVertical = await Attendance.aggregate([
      { $match: { event: { $in: closedEventIds } } },
      {
        $group: {
          _id: {
            vertical: '$vertical',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const vStatsMap = new Map();
    attendanceByVertical.forEach((item) => {
      if (!item._id.vertical) return;
      const vId = item._id.vertical.toString();
      if (!vStatsMap.has(vId)) {
        vStatsMap.set(vId, { present: 0, absent: 0 });
      }
      if (item._id.status === ATTENDANCE_STATUS.PRESENT) {
        vStatsMap.get(vId).present = item.count;
      } else if (item._id.status === ATTENDANCE_STATUS.ABSENT) {
        vStatsMap.get(vId).absent = item.count;
      }
    });

    const results = await Promise.all(
      verticals.map(async (v) => {
        const memberCount = await User.countDocuments({ vertical: v._id, isActive: true, role: ROLES.MEMBER });
        const vData = vStatsMap.get(v._id.toString()) || { present: 0, absent: 0 };
        const total = vData.present + vData.absent;
        const averageAttendance = total > 0 ? Number(((vData.present / total) * 100).toFixed(1)) : 0;

        return {
          verticalId: v._id,
          name: v.name,
          slug: v.slug,
          memberCount,
          averageAttendance,
          totalPresent: vData.present,
          totalRecords: total
        };
      })
    );

    return results;
  }

  /**
   * ADMIN: Vertical Leaderboard (Ranked by average attendance %)
   */
  async getVerticalLeaderboard(sessionFilter) {
    const comparison = await this.getVerticalComparison(sessionFilter);
    return comparison.sort((a, b) => b.averageAttendance - a.averageAttendance);
  }

  /**
   * ADMIN: Member Leaderboard and Streaks Calculation
   */
  async getMemberLeaderboard(sessionFilter, verticalId = null) {
    const session = await this.getEffectiveSession(sessionFilter);
    const memberQuery = { isActive: true, role: ROLES.MEMBER };
    if (verticalId) memberQuery.vertical = verticalId;

    const members = await User.find(memberQuery).populate('vertical', 'name slug');
    const closedEvents = await Event.find({ session, status: EVENT_STATUS.CLOSED }).sort({ date: 1, startTime: 1 });

    const attendanceRecords = await Attendance.find({
      event: { $in: closedEvents.map((e) => e._id) }
    });

    // Build lookup map: memberId -> Map(eventId -> status)
    const memberEventMap = new Map();
    attendanceRecords.forEach((att) => {
      const mId = att.member.toString();
      if (!memberEventMap.has(mId)) {
        memberEventMap.set(mId, new Map());
      }
      memberEventMap.get(mId).set(att.event.toString(), att.status);
    });

    const leaderboard = [];

    for (const member of members) {
      const mId = member._id.toString();
      const mAttendance = memberEventMap.get(mId) || new Map();

      // Find eligible events for this member
      const eligibleEvents = closedEvents.filter((e) => {
        if (e.date < member.joinedAt) return false;
        if (!e.targetVerticals || e.targetVerticals.length === 0) return true;
        return e.targetVerticals.some((v) => v.toString() === member.vertical?._id.toString());
      });

      const eligibleCount = eligibleEvents.length;
      let presentCount = 0;
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      // Calculate streak across eligible chronological events
      for (const event of eligibleEvents) {
        const status = mAttendance.get(event._id.toString());
        if (status === ATTENDANCE_STATUS.PRESENT) {
          presentCount++;
          tempStreak++;
          if (tempStreak > bestStreak) bestStreak = tempStreak;
        } else {
          tempStreak = 0;
        }
      }

      // Calculate current streak backwards from latest event
      for (let i = eligibleEvents.length - 1; i >= 0; i--) {
        const status = mAttendance.get(eligibleEvents[i]._id.toString());
        if (status === ATTENDANCE_STATUS.PRESENT) {
          currentStreak++;
        } else {
          break;
        }
      }

      const percentage = eligibleCount > 0 ? Number(((presentCount / eligibleCount) * 100).toFixed(1)) : null;

      leaderboard.push({
        memberId: member._id,
        name: member.name,
        email: member.email,
        studentId: member.memberId,
        vertical: member.vertical ? { _id: member.vertical._id, name: member.vertical.name } : null,
        eligibleCount,
        attendedCount: presentCount,
        percentage,
        currentStreak,
        bestStreak
      });
    }

    // Sort by percentage desc, then attendedCount desc, then currentStreak desc
    return leaderboard.sort((a, b) => {
      if (a.percentage === null) return 1;
      if (b.percentage === null) return -1;
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return b.currentStreak - a.currentStreak;
    });
  }

  /**
   * ADMIN: Attendance Heatmap (Members x Events matrix, capped to recent events)
   */
  async getAttendanceHeatmap(verticalId, sessionFilter, limitEvents = 15) {
    if (!verticalId) {
      throw new Error('Vertical ID is required for heatmap visualization');
    }

    const session = await this.getEffectiveSession(sessionFilter);
    const vObjectId = new mongoose.Types.ObjectId(verticalId);

    const [vertical, members, events] = await Promise.all([
      Vertical.findById(verticalId),
      User.find({ vertical: verticalId, isActive: true, role: ROLES.MEMBER }).sort({ name: 1 }),
      Event.find({
        session,
        status: EVENT_STATUS.CLOSED,
        $or: [{ targetVerticals: { $size: 0 } }, { targetVerticals: vObjectId }]
      })
        .sort({ date: -1, startTime: -1 })
        .limit(limitEvents)
    ]);

    if (!vertical) {
      throw new Error('Vertical not found');
    }

    // Reverse events so they read chronologically left-to-right
    const chronologicalEvents = [...events].reverse();
    const eventIds = chronologicalEvents.map((e) => e._id);

    const attendanceRecords = await Attendance.find({
      vertical: verticalId,
      event: { $in: eventIds }
    });

    const matrixMap = new Map();
    attendanceRecords.forEach((att) => {
      const key = `${att.member.toString()}_${att.event.toString()}`;
      matrixMap.set(key, att.status);
    });

    const rows = members.map((member) => {
      const eventStatuses = chronologicalEvents.map((event) => {
        if (event.date < member.joinedAt) {
          return { eventId: event._id, status: 'NOT_JOINED' };
        }
        const key = `${member._id.toString()}_${event._id.toString()}`;
        return {
          eventId: event._id,
          eventName: event.name,
          date: event.date,
          status: matrixMap.get(key) || null
        };
      });

      return {
        member: {
          _id: member._id,
          name: member.name,
          memberId: member.memberId
        },
        records: eventStatuses
      };
    });

    return {
      vertical: { _id: vertical._id, name: vertical.name },
      session,
      events: chronologicalEvents.map((e) => ({
        _id: e._id,
        name: e.name,
        type: e.type,
        date: e.date
      })),
      matrix: rows
    };
  }

  /**
   * ADMIN: List of Members Below Threshold
   */
  async getAtRiskMembers(sessionFilter) {
    const session = await this.getEffectiveSession(sessionFilter);
    const settings = await Settings.getSettings();

    const members = await User.find({ isActive: true, role: ROLES.MEMBER }).populate('vertical', 'name slug');
    const closedEvents = await Event.find({ session, status: EVENT_STATUS.CLOSED });
    const attendanceRecords = await Attendance.find({
      event: { $in: closedEvents.map((e) => e._id) },
      status: ATTENDANCE_STATUS.PRESENT
    });

    const presentMap = new Map();
    attendanceRecords.forEach((att) => {
      const mId = att.member.toString();
      presentMap.set(mId, (presentMap.get(mId) || 0) + 1);
    });

    const atRiskList = [];

    for (const member of members) {
      const eligible = closedEvents.filter((e) => {
        if (e.date < member.joinedAt) return false;
        if (!e.targetVerticals || e.targetVerticals.length === 0) return true;
        return e.targetVerticals.some((v) => v.toString() === member.vertical?._id.toString());
      });

      const eligibleCount = eligible.length;
      if (eligibleCount === 0) continue;

      const attendedCount = presentMap.get(member._id.toString()) || 0;
      const percentage = Number(((attendedCount / eligibleCount) * 100).toFixed(1));

      if (percentage < settings.lowAttendanceThreshold) {
        atRiskList.push({
          member: {
            _id: member._id,
            name: member.name,
            email: member.email,
            memberId: member.memberId,
            role: member.role,
            vertical: member.vertical,
            lastAlertSentAt: member.lastAlertSentAt
          },
          eligibleCount,
          attendedCount,
          absentCount: eligibleCount - attendedCount,
          percentage,
          threshold: settings.lowAttendanceThreshold
        });
      }
    }

    return atRiskList.sort((a, b) => a.percentage - b.percentage);
  }

  /**
   * VERTICAL HEAD: Vertical Summary (strictly scoped)
   */
  async getVerticalSummary(verticalId, sessionFilter) {
    const session = await this.getEffectiveSession(sessionFilter);
    const settings = await Settings.getSettings();
    const vObjectId = new mongoose.Types.ObjectId(verticalId);

    const [vertical, memberCount, closedEvents, upcomingEvents, members] = await Promise.all([
      Vertical.findById(verticalId).populate('secretary', 'name email').populate('leads', 'name email'),
      User.countDocuments({ vertical: verticalId, isActive: true, role: ROLES.MEMBER }),
      Event.find({
        session,
        status: EVENT_STATUS.CLOSED,
        $or: [{ targetVerticals: { $size: 0 } }, { targetVerticals: vObjectId }]
      }).sort({ date: 1, startTime: 1 }),
      Event.find({
        session,
        status: { $in: [EVENT_STATUS.SCHEDULED, EVENT_STATUS.OPEN] },
        $or: [{ targetVerticals: { $size: 0 } }, { targetVerticals: vObjectId }]
      }).sort({ startTime: 1 }).limit(5),
      User.find({ vertical: verticalId, isActive: true, role: ROLES.MEMBER }).sort({ name: 1 })
    ]);

    if (!vertical) throw new Error('Vertical not found');

    const closedEventIds = closedEvents.map((e) => e._id);
    const attendance = await Attendance.find({
      vertical: verticalId,
      event: { $in: closedEventIds }
    });

    const eventWiseStats = closedEvents.map((event) => {
      const eventAtt = attendance.filter((a) => a.event.toString() === event._id.toString());
      const present = eventAtt.filter((a) => a.status === ATTENDANCE_STATUS.PRESENT).length;
      const absent = eventAtt.filter((a) => a.status === ATTENDANCE_STATUS.ABSENT).length;
      const total = present + absent;
      return {
        eventId: event._id,
        name: event.name,
        date: event.date,
        present,
        absent,
        total,
        percentage: total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0
      };
    });

    let totalPresentOverall = 0;
    let totalMarksOverall = 0;
    eventWiseStats.forEach((e) => {
      totalPresentOverall += e.present;
      totalMarksOverall += e.total;
    });

    const averageAttendance = totalMarksOverall > 0 ? Number(((totalPresentOverall / totalMarksOverall) * 100).toFixed(1)) : 0;

    // Member-wise breakdown
    const memberSummary = members.map((member) => {
      const memberEligible = closedEvents.filter((e) => e.date >= member.joinedAt);
      const memberAtt = attendance.filter(
        (a) => a.member.toString() === member._id.toString() && a.status === ATTENDANCE_STATUS.PRESENT
      );
      const eligibleCount = memberEligible.length;
      const attendedCount = memberAtt.length;
      const percentage = eligibleCount > 0 ? Number(((attendedCount / eligibleCount) * 100).toFixed(1)) : null;

      return {
        _id: member._id,
        name: member.name,
        email: member.email,
        memberId: member.memberId,
        role: member.role,
        eligibleCount,
        attendedCount,
        absentCount: eligibleCount - attendedCount,
        percentage,
        isAtRisk: percentage !== null && percentage < settings.lowAttendanceThreshold
      };
    });

    const atRiskMembers = memberSummary.filter((m) => m.isAtRisk);

    return {
      vertical: {
        _id: vertical._id,
        name: vertical.name,
        slug: vertical.slug,
        secretary: vertical.secretary,
        leads: vertical.leads
      },
      session,
      memberCount,
      averageAttendance,
      threshold: settings.lowAttendanceThreshold,
      atRiskCount: atRiskMembers.length,
      atRiskMembers,
      upcomingEvents,
      eventWiseStats,
      memberSummary
    };
  }

  /**
   * MEMBER: Personal Attendance Summary
   */
  async getMemberSummary(userId, sessionFilter) {
    const session = await this.getEffectiveSession(sessionFilter);
    const settings = await Settings.getSettings();

    const member = await User.findById(userId).populate('vertical', 'name slug');
    if (!member) throw new Error('Member not found');

    const eventMatch = {
      session,
      status: EVENT_STATUS.CLOSED,
      date: { $gte: member.joinedAt }
    };

    if (member.vertical) {
      eventMatch.$or = [{ targetVerticals: { $size: 0 } }, { targetVerticals: member.vertical._id }];
    }

    const eligibleEvents = await Event.find(eventMatch).sort({ date: 1 });
    const eligibleEventIds = eligibleEvents.map((e) => e._id);

    const attendanceRecords = await Attendance.find({
      member: member._id,
      event: { $in: eligibleEventIds }
    }).populate('event', 'name date type venue');

    const presentRecords = attendanceRecords.filter((a) => a.status === ATTENDANCE_STATUS.PRESENT);
    const eligibleCount = eligibleEvents.length;
    const attendedCount = presentRecords.length;
    const absentCount = eligibleCount - attendedCount;
    const percentage = eligibleCount > 0 ? Number(((attendedCount / eligibleCount) * 100).toFixed(1)) : null;

    // Monthly breakdown (Month-Year grouping)
    const monthlyMap = new Map();
    attendanceRecords.forEach((att) => {
      if (!att.event?.date) return;
      const monthKey = new Date(att.event.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthKey, present: 0, absent: 0 });
      }
      if (att.status === ATTENDANCE_STATUS.PRESENT) {
        monthlyMap.get(monthKey).present++;
      } else {
        monthlyMap.get(monthKey).absent++;
      }
    });

    const monthlyStats = Array.from(monthlyMap.values());

    // Upcoming events for member's vertical
    const upcomingQuery = {
      session,
      status: { $in: [EVENT_STATUS.SCHEDULED, EVENT_STATUS.OPEN] }
    };
    if (member.vertical) {
      upcomingQuery.$or = [{ targetVerticals: { $size: 0 } }, { targetVerticals: member.vertical._id }];
    }
    const upcomingEvents = await Event.find(upcomingQuery).sort({ startTime: 1 }).limit(5);

    return {
      member: {
        _id: member._id,
        name: member.name,
        email: member.email,
        memberId: member.memberId,
        vertical: member.vertical,
        joinedAt: member.joinedAt
      },
      session,
      threshold: settings.lowAttendanceThreshold,
      eligibleCount,
      attendedCount,
      absentCount,
      percentage,
      isBelowThreshold: percentage !== null && percentage < settings.lowAttendanceThreshold,
      monthlyStats,
      upcomingEvents
    };
  }
}

export const analyticsService = new AnalyticsService();
