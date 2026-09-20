import express from 'express';
import {
  adminEditAttendance,
  listAttendanceRecords
} from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adminEditAttendanceSchema } from '../validators/attendance.validator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listAttendanceRecords);
router.patch('/:id', authorize(ROLES.ADMIN), validate(adminEditAttendanceSchema), adminEditAttendance);

export default router;
