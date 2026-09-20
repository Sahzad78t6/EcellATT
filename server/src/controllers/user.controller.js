import { userService } from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createUser = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const result = await userService.createUser({
    ...req.body,
    actor: req.user,
    ip
  });
  return ApiResponse.created(res, result, 'User created successfully');
});

export const bulkCreateUsers = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const { csvContent, sendEmailCredentials } = req.body;

  if (!csvContent) {
    return ApiResponse.error(res, 'CSV content is required', 400);
  }

  const result = await userService.bulkCreateUsersFromCsv({
    csvContent,
    sendEmailCredentials: Boolean(sendEmailCredentials),
    actor: req.user,
    ip
  });

  return ApiResponse.success(res, result, `Bulk import finished: ${result.importedCount} created, ${result.failedCount} errors.`);
});

export const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  return ApiResponse.success(res, result, 'Users retrieved successfully');
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return ApiResponse.success(res, user, 'User retrieved successfully');
});

export const updateUser = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user = await userService.updateUser(req.params.id, req.body, req.user, ip);
  return ApiResponse.success(res, user, 'User updated successfully');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const result = await userService.resetPassword(req.params.id, req.body, req.user, ip);
  return ApiResponse.success(res, result, 'Password reset successfully');
});
