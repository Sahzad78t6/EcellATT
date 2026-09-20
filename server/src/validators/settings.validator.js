import { z } from 'zod';

export const updateSettingsSchema = {
  body: z.object({
    lowAttendanceThreshold: z.number().min(1).max(100).optional(),
    minEventsForAlert: z.number().min(1).optional(),
    alertCooldownDays: z.number().min(0).optional(),
    autoCloseBufferMinutes: z.number().min(0).optional(),
    emailAlertsEnabled: z.boolean().optional(),
    currentSession: z.string().min(1).optional(),
    timezone: z.string().min(1).optional()
  })
};
