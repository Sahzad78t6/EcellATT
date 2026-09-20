import { verifyToken } from '../utils/token.js';
import { User } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ROLES } from '../config/constants.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return ApiResponse.error(res, 'Authentication required. Please log in.', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return ApiResponse.error(res, 'Invalid or expired session. Please log in again.', 401);
    }

    const user = await User.findById(decoded.userId).populate('vertical', 'name slug');
    if (!user) {
      return ApiResponse.error(res, 'User not found.', 401);
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'Your account has been deactivated. Please contact an admin.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        'Access denied: You do not have permission to perform this action.',
        403
      );
    }

    next();
  };
};

export const verticalScope = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.error(res, 'Authentication required.', 401);
  }

  if (req.user.role === ROLES.ADMIN) {
    // Admin can specify vertical in query or body, or see all
    req.scopedVerticalId = req.query.verticalId || req.body.verticalId || null;
    return next();
  }

  if (req.user.role === ROLES.SECRETARY || req.user.role === ROLES.LEAD) {
    if (!req.user.vertical) {
      return ApiResponse.error(res, 'You are not assigned to any vertical.', 403);
    }
    const verticalId = req.user.vertical._id ? req.user.vertical._id.toString() : req.user.vertical.toString();
    req.scopedVerticalId = verticalId;
    return next();
  }

  return ApiResponse.error(res, 'Access denied.', 403);
};
