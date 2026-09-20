import { verticalService } from '../services/vertical.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listVerticals = asyncHandler(async (req, res) => {
  const verticals = await verticalService.listVerticals();
  return ApiResponse.success(res, verticals, 'Verticals retrieved successfully');
});

export const getVerticalById = asyncHandler(async (req, res) => {
  const vertical = await verticalService.getVerticalById(req.params.id);
  return ApiResponse.success(res, vertical, 'Vertical retrieved successfully');
});

export const createVertical = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const vertical = await verticalService.createVertical({
    ...req.body,
    actor: req.user,
    ip
  });
  return ApiResponse.created(res, vertical, 'Vertical created successfully');
});

export const updateVertical = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const vertical = await verticalService.updateVertical(req.params.id, req.body, req.user, ip);
  return ApiResponse.success(res, vertical, 'Vertical updated successfully');
});
