import { attendanceService } from '../services/attendance.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getEventRoster = asyncHandler(async (req, res) => {
  const result = await attendanceService.getEventRoster(req.params.id, {
    verticalId: req.query.verticalId || req.scopedVerticalId || null,
    user: req.user
  });
  return ApiResponse.success(res, result, 'Roster retrieved successfully');
});

export const markAttendance = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const result = await attendanceService.markAttendance(
    req.params.id,
    {
      records: req.body.records,
      verticalId: req.body.verticalId || req.scopedVerticalId || null
    },
    req.user,
    ip
  );
  return ApiResponse.success(res, result, result.message);
});

export const adminEditAttendance = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const result = await attendanceService.adminEditAttendance(
    req.params.id,
    req.body,
    req.user,
    ip
  );
  return ApiResponse.success(res, result, 'Attendance record updated successfully');
});

export const listAttendanceRecords = asyncHandler(async (req, res) => {
  const result = await attendanceService.listAttendanceRecords(req.query);
  return ApiResponse.success(res, result, 'Attendance records retrieved successfully');
});
