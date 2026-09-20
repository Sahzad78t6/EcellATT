import { analyticsService } from '../services/analytics.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAdminOverview = asyncHandler(async (req, res) => {
  const result = await analyticsService.getAdminOverview(req.query.session);
  return ApiResponse.success(res, result, 'Admin overview metrics retrieved');
});

export const getAttendanceTrends = asyncHandler(async (req, res) => {
  const result = await analyticsService.getAttendanceTrends(req.query.session, req.query.verticalId);
  return ApiResponse.success(res, result, 'Attendance trends retrieved');
});

export const getVerticalComparison = asyncHandler(async (req, res) => {
  const result = await analyticsService.getVerticalComparison(req.query.session);
  return ApiResponse.success(res, result, 'Vertical comparison retrieved');
});

export const getVerticalLeaderboard = asyncHandler(async (req, res) => {
  const result = await analyticsService.getVerticalLeaderboard(req.query.session);
  return ApiResponse.success(res, result, 'Vertical leaderboard retrieved');
});

export const getMemberLeaderboard = asyncHandler(async (req, res) => {
  const result = await analyticsService.getMemberLeaderboard(req.query.session, req.query.verticalId);
  return ApiResponse.success(res, result, 'Member leaderboard retrieved');
});

export const getAttendanceHeatmap = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 15;
  const result = await analyticsService.getAttendanceHeatmap(req.query.verticalId, req.query.session, limit);
  return ApiResponse.success(res, result, 'Attendance heatmap matrix retrieved');
});

export const getAtRiskMembers = asyncHandler(async (req, res) => {
  const result = await analyticsService.getAtRiskMembers(req.query.session);
  return ApiResponse.success(res, result, 'At-risk members retrieved');
});

export const getVerticalSummary = asyncHandler(async (req, res) => {
  const verticalId = req.scopedVerticalId;
  if (!verticalId) {
    return ApiResponse.error(res, 'Vertical ID is required', 400);
  }
  const result = await analyticsService.getVerticalSummary(verticalId, req.query.session);
  return ApiResponse.success(res, result, 'Vertical summary retrieved');
});

export const getMemberSummary = asyncHandler(async (req, res) => {
  const result = await analyticsService.getMemberSummary(req.user._id, req.query.session);
  return ApiResponse.success(res, result, 'Member personal summary retrieved');
});
