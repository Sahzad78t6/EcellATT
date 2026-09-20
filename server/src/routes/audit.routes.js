import express from 'express';
import { listAuditLogs } from '../controllers/audit.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/', listAuditLogs);

export default router;
