import express from 'express';
import {
  getMemberWiseReport,
  getEventWiseReport,
  getVerticalWiseReport
} from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/members', getMemberWiseReport);
router.get('/events', getEventWiseReport);
router.get('/verticals', getVerticalWiseReport);

export default router;
