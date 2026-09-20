import { Settings } from '../models/Settings.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { auditService } from '../services/audit.service.js';
import { AUDIT_ACTIONS } from '../config/constants.js';

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  return ApiResponse.success(res, settings, 'Settings retrieved successfully');
});

export const updateSettings = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  let settings = await Settings.getSettings();

  const before = settings.toObject();

  if (req.body.lowAttendanceThreshold !== undefined) {
    settings.lowAttendanceThreshold = req.body.lowAttendanceThreshold;
  }
  if (req.body.minEventsForAlert !== undefined) {
    settings.minEventsForAlert = req.body.minEventsForAlert;
  }
  if (req.body.alertCooldownDays !== undefined) {
    settings.alertCooldownDays = req.body.alertCooldownDays;
  }
  if (req.body.autoCloseBufferMinutes !== undefined) {
    settings.autoCloseBufferMinutes = req.body.autoCloseBufferMinutes;
  }
  if (req.body.emailAlertsEnabled !== undefined) {
    settings.emailAlertsEnabled = req.body.emailAlertsEnabled;
  }
  if (req.body.currentSession !== undefined) {
    settings.currentSession = req.body.currentSession;
  }
  if (req.body.timezone !== undefined) {
    settings.timezone = req.body.timezone;
  }

  await settings.save();

  await auditService.log({
    actor: req.user._id,
    action: AUDIT_ACTIONS.UPDATE,
    entityType: 'Settings',
    entityId: settings._id,
    before,
    after: settings.toObject(),
    reason: 'Admin updated system configuration and thresholds',
    ip
  });

  return ApiResponse.success(res, settings, 'Settings updated successfully');
});
