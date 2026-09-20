import express from 'express';
import {
  getAdminOverview,
  getAttendanceTrends,
  getVerticalComparison,
  getVerticalLeaderboard,
  getMemberLeaderboard,
  getAttendanceHeatmap,
  getAtRiskMembers,
  getVerticalSummary,
  getMemberSummary
} from '../controllers/analytics.controller.js';
import { authenticate, authorize, verticalScope } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

// Admin-only analytics endpoints
router.get('/admin/overview', authorize(ROLES.ADMIN), getAdminOverview);
router.get('/admin/trends', authorize(ROLES.ADMIN), getAttendanceTrends);
router.get('/admin/vertical-comparison', authorize(ROLES.ADMIN), getVerticalComparison);
router.get('/admin/vertical-leaderboard', authorize(ROLES.ADMIN), getVerticalLeaderboard);
router.get('/admin/member-leaderboard', authorize(ROLES.ADMIN), getMemberLeaderboard);
router.get('/admin/heatmap', authorize(ROLES.ADMIN), getAttendanceHeatmap);
router.get('/admin/at-risk', authorize(ROLES.ADMIN), getAtRiskMembers);

// Vertical Head analytics endpoint (derived from authenticated user)
router.get(
  '/vertical/summary',
  authorize(ROLES.ADMIN, ROLES.SECRETARY, ROLES.LEAD),
  verticalScope,
  getVerticalSummary
);

// Member personal analytics
router.get('/member/me', getMemberSummary);

export default router;
