import { z } from 'zod';
import { ATTENDANCE_STATUS } from '../config/constants.js';

export const markAttendanceSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event ID')
  }),
  body: z.object({
    verticalId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vertical ID').optional(),
    records: z.array(
      z.object({
        memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID'),
        status: z.enum([ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.ABSENT]),
        remarks: z.string().optional().default('')
      })
    ).min(1, 'At least one attendance record is required')
  })
};

export const adminEditAttendanceSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid attendance ID')
  }),
  body: z.object({
    status: z.enum([ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.ABSENT]),
    reason: z.string().min(5, 'A valid reason of at least 5 characters is required for admin edit'),
    remarks: z.string().optional()
  })
};
