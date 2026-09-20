import { reportService } from '../services/report.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMemberWiseReport = asyncHandler(async (req, res) => {
  const { session, verticalId, statusFilter, export: exportFormat } = req.query;

  const data = await reportService.getMemberWiseReport({
    session,
    verticalId,
    statusFilter
  });

  if (exportFormat === 'csv') {
    const csv = await reportService.exportToCsv(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="member_attendance_report_${session || 'all'}.csv"`);
    return res.send(csv);
  }

  if (exportFormat === 'xlsx') {
    const buffer = await reportService.exportToExcel(data, 'Member Attendance');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="member_attendance_report_${session || 'all'}.xlsx"`);
    return res.send(buffer);
  }

  return ApiResponse.success(res, data, 'Member report retrieved');
});

export const getEventWiseReport = asyncHandler(async (req, res) => {
  const { session, verticalId, type, export: exportFormat } = req.query;

  const data = await reportService.getEventWiseReport({
    session,
    verticalId,
    type
  });

  if (exportFormat === 'csv') {
    const csv = await reportService.exportToCsv(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="event_attendance_report_${session || 'all'}.csv"`);
    return res.send(csv);
  }

  if (exportFormat === 'xlsx') {
    const buffer = await reportService.exportToExcel(data, 'Event Attendance');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="event_attendance_report_${session || 'all'}.xlsx"`);
    return res.send(buffer);
  }

  return ApiResponse.success(res, data, 'Event report retrieved');
});

export const getVerticalWiseReport = asyncHandler(async (req, res) => {
  const { session, export: exportFormat } = req.query;

  const data = await reportService.getVerticalWiseReport({ session });

  if (exportFormat === 'csv') {
    const csv = await reportService.exportToCsv(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="vertical_attendance_report_${session || 'all'}.csv"`);
    return res.send(csv);
  }

  if (exportFormat === 'xlsx') {
    const buffer = await reportService.exportToExcel(data, 'Vertical Attendance');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="vertical_attendance_report_${session || 'all'}.xlsx"`);
    return res.send(buffer);
  }

  return ApiResponse.success(res, data, 'Vertical report retrieved');
});
