import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { getCookieOptions } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const result = await authService.login({ identifier, password, ip });

  res.cookie('token', result.token, getCookieOptions());

  return ApiResponse.success(
    res,
    {
      user: result.user,
      token: result.token
    },
    'Login successful'
  );
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', getCookieOptions());
  return ApiResponse.success(res, null, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  return ApiResponse.success(res, user, 'Profile retrieved');
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const result = await authService.changePassword({
    userId: req.user._id,
    currentPassword,
    newPassword,
    ip
  });

  return ApiResponse.success(res, null, result.message);
});
