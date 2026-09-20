import { EmailLog } from '../models/EmailLog.js';
import { alertService } from '../services/alert.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listEmailLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, type, memberId } = req.query;

  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (memberId) query.member = memberId;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    EmailLog.find(query)
      .populate('member', 'name email memberId role')
      .populate('event', 'name date')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limitNum),
    EmailLog.countDocuments(query)
  ]);

  return ApiResponse.success(
    res,
    {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    },
    'Email logs retrieved successfully'
  );
});

export const sendAlertsNow = asyncHandler(async (req, res) => {
  const { forceCooldown } = req.body;
  const result = await alertService.sendAlertsToAllAtRiskMembers({ forceCooldown: Boolean(forceCooldown) });
  return ApiResponse.success(res, result, `Alert dispatch complete: ${result.sent} sent, ${result.skipped} skipped, ${result.failed} failed.`);
});

export const retryEmailLog = asyncHandler(async (req, res) => {
  const result = await alertService.retryEmailLog(req.params.id);
  if (!result.success) {
    return ApiResponse.error(res, result.error || 'Retry failed', 500);
  }
  return ApiResponse.success(res, result, result.message);
});
