import { AuditLog } from '../models/AuditLog.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, actor, action, entityType, startDate, endDate } = req.query;

  const query = {};
  if (actor) query.actor = actor;
  if (action) query.action = action;
  if (entityType) query.entityType = entityType;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('actor', 'name email memberId role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    AuditLog.countDocuments(query)
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
    'Audit logs retrieved successfully'
  );
});
