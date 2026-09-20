import express from 'express';
import {
  createEvent,
  updateEvent,
  getEventById,
  listEvents,
  openEvent,
  closeEvent,
  reopenEvent,
  cancelEvent
} from '../controllers/event.controller.js';
import { getEventRoster, markAttendance } from '../controllers/attendance.controller.js';
import { authenticate, authorize, verticalScope } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createEventSchema,
  updateEventSchema,
  listEventsSchema
} from '../validators/event.validator.js';
import { markAttendanceSchema } from '../validators/attendance.validator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

// Publicly readable for authenticated users (with filtering)
router.get('/', validate(listEventsSchema), listEvents);
router.get('/:id', getEventById);

// Head & Admin roster and marking routes
router.get(
  '/:id/roster',
  authorize(ROLES.ADMIN, ROLES.SECRETARY, ROLES.LEAD),
  verticalScope,
  getEventRoster
);

router.put(
  '/:id/attendance',
  authorize(ROLES.ADMIN, ROLES.SECRETARY, ROLES.LEAD),
  verticalScope,
  validate(markAttendanceSchema),
  markAttendance
);

// Admin-only event management & status transition controls
router.post('/', authorize(ROLES.ADMIN), validate(createEventSchema), createEvent);
router.put('/:id', authorize(ROLES.ADMIN), validate(updateEventSchema), updateEvent);
router.post('/:id/open', authorize(ROLES.ADMIN), openEvent);
router.post('/:id/close', authorize(ROLES.ADMIN), closeEvent);
router.post('/:id/reopen', authorize(ROLES.ADMIN), reopenEvent);
router.post('/:id/cancel', authorize(ROLES.ADMIN), cancelEvent);

export default router;
