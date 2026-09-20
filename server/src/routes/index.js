import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import verticalRoutes from './vertical.routes.js';
import eventRoutes from './event.routes.js';
import attendanceRoutes from './attendance.routes.js';
import analyticsRoutes from './analytics.routes.js';
import reportRoutes from './report.routes.js';
import settingsRoutes from './settings.routes.js';
import auditRoutes from './audit.routes.js';
import emailLogRoutes from './emailLog.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/verticals', verticalRoutes);
router.use('/events', eventRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/email-logs', emailLogRoutes);
router.use('/alerts', emailLogRoutes); // Alias for POST /alerts/send-now

export default router;
