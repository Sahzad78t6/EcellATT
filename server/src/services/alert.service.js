import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Attendance } from '../models/Attendance.js';
import { Settings } from '../models/Settings.js';
import { EmailLog } from '../models/EmailLog.js';
import { emailService } from './email.service.js';
import { generateLowAttendanceEmail } from '../templates/lowAttendanceEmail.js';
import { EMAIL_TYPES, EMAIL_STATUS, EVENT_STATUS, ATTENDANCE_STATUS, ROLES } from '../config/constants.js';
import { ENV } from '../config/env.js';

class AlertService {
  /**
   * Calculates a member's attendance statistics.
   * Eligible events: CLOSED, not CANCELLED, date >= member.joinedAt,
   * targets member's vertical (or targets all verticals), matching session if provided.
   */
  async calculateMemberAttendance(memberId, session = null) {
    const member = await User.findById(memberId);
    if (!member) return null;

    const settings = await Settings.getSettings();
    const activeSession = session || settings.currentSession;

    const eventQuery = {
      status: EVENT_STATUS.CLOSED,
      date: { $gte: member.joinedAt },
      session: activeSession
    };

    if (member.vertical) {
      eventQuery.$or = [
        { targetVerticals: { $size: 0 } },
        { targetVerticals: member.vertical }
      ];
    }

    const eligibleEvents = await Event.find(eventQuery).select('_id');
    const eligibleCount = eligibleEvents.length;

    if (eligibleCount === 0) {
      return {
        member,
        eligibleCount: 0,
        attendedCount: 0,
        absentCount: 0,
        percentage: null // N/A
      };
    }

    const eligibleEventIds = eligibleEvents.map((e) => e._id);
    const presentCount = await Attendance.countDocuments({
      member: member._id,
      event: { $in: eligibleEventIds },
      status: ATTENDANCE_STATUS.PRESENT
    });

    const percentage = (presentCount / eligibleCount) * 100;

    return {
      member,
      eligibleCount,
      attendedCount: presentCount,
      absentCount: eligibleCount - presentCount,
      percentage: Number(percentage.toFixed(2))
    };
  }

  /**
   * Runs the low-attendance alert evaluator for targeted verticals after an event closes.
   */
  async evaluateAndSendAlertsForClosedEvent(event) {
    try {
      const settings = await Settings.getSettings();
      if (!settings.emailAlertsEnabled) {
        console.log('[AlertService] Email alerts are disabled in settings. Skipping alert dispatch.');
        return { sent: 0, skipped: 0, failed: 0 };
      }

      // Identify targeted members
      const memberQuery = { isActive: true, role: ROLES.MEMBER };
      if (event.targetVerticals && event.targetVerticals.length > 0) {
        memberQuery.vertical = { $in: event.targetVerticals };
      }

      const members = await User.find(memberQuery);
      let sentCount = 0;
      let skippedCount = 0;
      let failedCount = 0;

      for (const member of members) {
        try {
          const stats = await this.calculateMemberAttendance(member._id, event.session);
          if (!stats || stats.percentage === null) continue;

          // Check if eligible count meets minimum required for alerts
          if (stats.eligibleCount < settings.minEventsForAlert) {
            continue;
          }

          // Check if attendance is below threshold
          if (stats.percentage < settings.lowAttendanceThreshold) {
            // Check cooldown
            const cooldownMs = settings.alertCooldownDays * 24 * 60 * 60 * 1000;
            if (member.lastAlertSentAt && Date.now() - new Date(member.lastAlertSentAt).getTime() < cooldownMs) {
              await EmailLog.create({
                member: member._id,
                event: event._id,
                type: EMAIL_TYPES.LOW_ATTENDANCE,
                toEmail: member.email,
                attendancePercent: stats.percentage,
                status: EMAIL_STATUS.SKIPPED,
                attempts: 0,
                error: `Cooldown active (${settings.alertCooldownDays} days)`
              });
              skippedCount++;
              continue;
            }

            // Generate and send email
            const { html, text } = generateLowAttendanceEmail({
              memberName: member.name,
              attendancePercent: stats.percentage,
              threshold: settings.lowAttendanceThreshold,
              attendedCount: stats.attendedCount,
              eligibleCount: stats.eligibleCount,
              eventName: event.name,
              portalUrl: ENV.PORTAL_URL
            });

            const sendResult = await emailService.sendMail({
              to: member.email,
              subject: `Attendance Alert: ${stats.percentage}% - Action Required (E-Cell)`,
              html,
              text
            });

            if (sendResult.success) {
              await EmailLog.create({
                member: member._id,
                event: event._id,
                type: EMAIL_TYPES.LOW_ATTENDANCE,
                toEmail: member.email,
                attendancePercent: stats.percentage,
                status: EMAIL_STATUS.SENT,
                attempts: sendResult.attempt || 1,
                sentAt: new Date()
              });
              await User.findByIdAndUpdate(member._id, { lastAlertSentAt: new Date() });
              sentCount++;
            } else {
              await EmailLog.create({
                member: member._id,
                event: event._id,
                type: EMAIL_TYPES.LOW_ATTENDANCE,
                toEmail: member.email,
                attendancePercent: stats.percentage,
                status: EMAIL_STATUS.FAILED,
                attempts: 3,
                error: sendResult.error || 'Failed to dispatch email'
              });
              failedCount++;
            }

            // Small delay between sequential emails to avoid throttling
            await new Promise((res) => setTimeout(res, 100));
          }
        } catch (memberErr) {
          console.error(`[AlertService] Error evaluating alert for member ${member.email}:`, memberErr.message);
        }
      }

      console.log(`[AlertService] Alert routine complete for "${event.name}". Sent: ${sentCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`);
      return { sent: sentCount, skipped: skippedCount, failed: failedCount };
    } catch (err) {
      console.error('[AlertService] Error during alert routine:', err.message);
      return { sent: 0, skipped: 0, failed: 0, error: err.message };
    }
  }

  /**
   * Admin triggered "Send alerts now" for all at-risk members
   */
  async sendAlertsToAllAtRiskMembers({ forceCooldown = false } = {}) {
    const settings = await Settings.getSettings();
    const members = await User.find({ isActive: true, role: ROLES.MEMBER });

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const member of members) {
      try {
        const stats = await this.calculateMemberAttendance(member._id, settings.currentSession);
        if (!stats || stats.percentage === null) continue;

        if (stats.eligibleCount < settings.minEventsForAlert) continue;

        if (stats.percentage < settings.lowAttendanceThreshold) {
          const cooldownMs = settings.alertCooldownDays * 24 * 60 * 60 * 1000;
          if (!forceCooldown && member.lastAlertSentAt && Date.now() - new Date(member.lastAlertSentAt).getTime() < cooldownMs) {
            await EmailLog.create({
              member: member._id,
              event: null,
              type: EMAIL_TYPES.LOW_ATTENDANCE,
              toEmail: member.email,
              attendancePercent: stats.percentage,
              status: EMAIL_STATUS.SKIPPED,
              attempts: 0,
              error: `Cooldown active (${settings.alertCooldownDays} days)`
            });
            skipped++;
            continue;
          }

          const { html, text } = generateLowAttendanceEmail({
            memberName: member.name,
            attendancePercent: stats.percentage,
            threshold: settings.lowAttendanceThreshold,
            attendedCount: stats.attendedCount,
            eligibleCount: stats.eligibleCount,
            eventName: 'Manual Admin Dispatch',
            portalUrl: ENV.PORTAL_URL
          });

          const sendResult = await emailService.sendMail({
            to: member.email,
            subject: `Urgent Attendance Alert: ${stats.percentage}% (E-Cell)`,
            html,
            text
          });

          if (sendResult.success) {
            await EmailLog.create({
              member: member._id,
              event: null,
              type: EMAIL_TYPES.LOW_ATTENDANCE,
              toEmail: member.email,
              attendancePercent: stats.percentage,
              status: EMAIL_STATUS.SENT,
              attempts: sendResult.attempt || 1,
              sentAt: new Date()
            });
            await User.findByIdAndUpdate(member._id, { lastAlertSentAt: new Date() });
            sent++;
          } else {
            await EmailLog.create({
              member: member._id,
              event: null,
              type: EMAIL_TYPES.LOW_ATTENDANCE,
              toEmail: member.email,
              attendancePercent: stats.percentage,
              status: EMAIL_STATUS.FAILED,
              attempts: 3,
              error: sendResult.error || 'Failed to dispatch email'
            });
            failed++;
          }

          await new Promise((res) => setTimeout(res, 100));
        }
      } catch (err) {
        console.error(`[AlertService] Manual alert error for member ${member.email}:`, err.message);
      }
    }

    return { sent, skipped, failed };
  }

  /**
   * Retries sending a failed email log
   */
  async retryEmailLog(logId) {
    const log = await EmailLog.findById(logId).populate('member').populate('event');
    if (!log) {
      throw new Error('Email log not found');
    }

    if (log.status === EMAIL_STATUS.SENT) {
      return { success: true, message: 'Email was already sent successfully' };
    }

    const settings = await Settings.getSettings();
    let emailPayload = null;

    if (log.type === EMAIL_TYPES.LOW_ATTENDANCE) {
      const stats = await this.calculateMemberAttendance(log.member._id, settings.currentSession);
      const emailContent = generateLowAttendanceEmail({
        memberName: log.member.name,
        attendancePercent: log.attendancePercent || stats?.percentage || 0,
        threshold: settings.lowAttendanceThreshold,
        attendedCount: stats?.attendedCount || 0,
        eligibleCount: stats?.eligibleCount || 0,
        eventName: log.event?.name || 'Attendance Review',
        portalUrl: ENV.PORTAL_URL
      });

      emailPayload = {
        to: log.toEmail,
        subject: `Attendance Alert: ${log.attendancePercent || stats?.percentage || 0}% - Action Required (E-Cell)`,
        ...emailContent
      };
    }

    if (!emailPayload) {
      throw new Error('Unsupported email log type for retry');
    }

    const sendResult = await emailService.sendMail(emailPayload);
    log.attempts += 1;

    if (sendResult.success) {
      log.status = EMAIL_STATUS.SENT;
      log.error = null;
      log.sentAt = new Date();
      await log.save();
      await User.findByIdAndUpdate(log.member._id, { lastAlertSentAt: new Date() });
      return { success: true, message: 'Email retried and sent successfully' };
    } else {
      log.error = sendResult.error;
      await log.save();
      return { success: false, error: sendResult.error };
    }
  }
}

export const alertService = new AlertService();
