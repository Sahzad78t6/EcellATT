import express from 'express';
import {
  listEmailLogs,
  sendAlertsNow,
  retryEmailLog
} from '../controllers/emailLog.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/', listEmailLogs);
router.post('/send-now', sendAlertsNow);
router.post('/:id/retry', retryEmailLog);

export default router;
