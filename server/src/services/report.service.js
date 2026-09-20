import ExcelJS from 'exceljs';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Attendance } from '../models/Attendance.js';
import { Vertical } from '../models/Vertical.js';
import { Settings } from '../models/Settings.js';
import { EVENT_STATUS, ATTENDANCE_STATUS, ROLES } from '../config/constants.js';
import { formatInTimezone } from '../utils/dateUtils.js';

class ReportService {
  /**
   * Generates Member-Wise Attendance Report Data
   */
  async getMemberWiseReport({ session, verticalId, statusFilter }) {
    const settings = await Settings.getSettings();
    const activeSession = session || settings.currentSession;

    const userQuery = { isActive: true, role: { $ne: ROLES.ADMIN } };
    if (verticalId) userQuery.vertical = verticalId;

    const members = await User.find(userQuery).populate('vertical', 'name slug').sort({ name: 1 });
    const closedEvents = await Event.find({ session: activeSession, status: EVENT_STATUS.CLOSED });

    const attendance = await Attendance.find({
      event: { $in: closedEvents.map((e) => e._id) }
    });

    const attMap = new Map();
    attendance.forEach((a) => {
      const mId = a.member.toString();
      if (!attMap.has(mId)) attMap.set(mId, []);
      attMap.get(mId).push(a);
    });

    const report = [];

    for (const member of members) {
      const mRecords = attMap.get(member._id.toString()) || [];
      const eligibleEvents = closedEvents.filter((e) => {
        if (e.date < member.joinedAt) return false;
        if (!e.targetVerticals || e.targetVerticals.length === 0) return true;
        return e.targetVerticals.some((v) => v.toString() === member.vertical?._id?.toString());
      });

      const eligibleCount = eligibleEvents.length;
      const presentCount = mRecords.filter((r) => r.status === ATTENDANCE_STATUS.PRESENT).length;
      const absentCount = eligibleCount - presentCount;
      const percentage = eligibleCount > 0 ? Number(((presentCount / eligibleCount) * 100).toFixed(1)) : null;

      const isAtRisk = percentage !== null && percentage < settings.lowAttendanceThreshold;
      const statusLabel = percentage === null ? 'N/A' : isAtRisk ? 'At Risk' : 'Good';

      if (statusFilter && statusFilter !== 'ALL') {
        if (statusFilter === 'AT_RISK' && !isAtRisk) continue;
        if (statusFilter === 'GOOD' && isAtRisk) continue;
      }

      report.push({
        memberId: member.memberId,
        name: member.name,
        email: member.email,
        vertical: member.vertical?.name || 'Unassigned',
        role: member.role,
        phone: member.phone || '',
        year: member.year || '',
        branch: member.branch || '',
        eligibleEvents: eligibleCount,
        attendedEvents: presentCount,
        missedEvents: absentCount,
        attendancePercentage: percentage !== null ? `${percentage}%` : 'N/A',
        status: statusLabel
      });
    }

    return report;
  }

  /**
   * Generates Event-Wise Attendance Report Data
   */
  async getEventWiseReport({ session, verticalId, type }) {
    const settings = await Settings.getSettings();
    const activeSession = session || settings.currentSession;

    const query = { session: activeSession, status: EVENT_STATUS.CLOSED };
    if (type) query.type = type;
    if (verticalId) {
      query.$or = [{ targetVerticals: { $size: 0 } }, { targetVerticals: verticalId }];
    }

    const events = await Event.find(query).populate('targetVerticals', 'name').sort({ date: -1 });
    const eventIds = events.map((e) => e._id);

    const attendance = await Attendance.find({ event: { $in: eventIds } });

    const attMap = new Map();
    attendance.forEach((a) => {
      const eId = a.event.toString();
      if (!attMap.has(eId)) attMap.set(eId, { present: 0, absent: 0 });
      if (a.status === ATTENDANCE_STATUS.PRESENT) {
        attMap.get(eId).present++;
      } else {
        attMap.get(eId).absent++;
      }
    });

    return events.map((event) => {
      const counts = attMap.get(event._id.toString()) || { present: 0, absent: 0 };
      const total = counts.present + counts.absent;
      const percentage = total > 0 ? Number(((counts.present / total) * 100).toFixed(1)) : 0;
      const targetScope =
        event.targetVerticals && event.targetVerticals.length > 0
          ? event.targetVerticals.map((v) => v.name).join(', ')
          : 'All Verticals';

      return {
        eventName: event.name,
        type: event.type,
        date: formatInTimezone(event.date, 'YYYY-MM-DD'),
        session: event.session,
        targetScope,
        venue: event.venue,
        presentCount: counts.present,
        absentCount: counts.absent,
        totalMarked: total,
        attendancePercentage: `${percentage}%`
      };
    });
  }

  /**
   * Generates Vertical-Wise Attendance Report Data
   */
  async getVerticalWiseReport({ session }) {
    const settings = await Settings.getSettings();
    const activeSession = session || settings.currentSession;

    const verticals = await Vertical.find({ isActive: true }).sort({ name: 1 });
    const closedEvents = await Event.find({ session: activeSession, status: EVENT_STATUS.CLOSED });
    const closedEventIds = closedEvents.map((e) => e._id);

    const attendance = await Attendance.find({ event: { $in: closedEventIds } });

    const vStatsMap = new Map();
    attendance.forEach((a) => {
      if (!a.vertical) return;
      const vId = a.vertical.toString();
      if (!vStatsMap.has(vId)) vStatsMap.set(vId, { present: 0, absent: 0 });
      if (a.status === ATTENDANCE_STATUS.PRESENT) {
        vStatsMap.get(vId).present++;
      } else {
        vStatsMap.get(vId).absent++;
      }
    });

    const results = await Promise.all(
      verticals.map(async (v) => {
        const memberCount = await User.countDocuments({ vertical: v._id, isActive: true });
        const counts = vStatsMap.get(v._id.toString()) || { present: 0, absent: 0 };
        const total = counts.present + counts.absent;
        const avgPercentage = total > 0 ? Number(((counts.present / total) * 100).toFixed(1)) : 0;

        return {
          verticalName: v.name,
          totalMembers: memberCount,
          totalAttendanceRecords: total,
          totalPresent: counts.present,
          totalAbsent: counts.absent,
          averagePercentage: `${avgPercentage}%`
        };
      })
    );

    return results;
  }

  /**
   * Exports data to CSV string
   */
  async exportToCsv(data) {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((header) => {
        let val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Exports data to Excel (.xlsx) buffer
   */
  async exportToExcel(data, sheetName = 'Report') {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'E-Cell Attendance System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(sheetName);

    if (!data || data.length === 0) {
      worksheet.addRow(['No data available']);
      return workbook.xlsx.writeBuffer();
    }

    const headers = Object.keys(data[0]);
    worksheet.columns = headers.map((h) => ({
      header: h.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      key: h,
      width: Math.max(h.length + 6, 16)
    }));

    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E1B4B' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    data.forEach((row) => {
      worksheet.addRow(row);
    });

    // Alternate row styling
    for (let i = 2; i <= data.length + 1; i++) {
      const r = worksheet.getRow(i);
      if (i % 2 === 0) {
        r.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        };
      }
    }

    return workbook.xlsx.writeBuffer();
  }
}

export const reportService = new ReportService();
