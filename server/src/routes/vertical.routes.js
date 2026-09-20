import express from 'express';
import {
  listVerticals,
  getVerticalById,
  createVertical,
  updateVertical,
  deleteVertical
} from '../controllers/vertical.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createVerticalSchema, updateVerticalSchema } from '../validators/vertical.validator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listVerticals);
router.get('/:id', getVerticalById);
router.post('/', authorize(ROLES.ADMIN), validate(createVerticalSchema), createVertical);
router.put('/:id', authorize(ROLES.ADMIN), validate(updateVerticalSchema), updateVertical);
router.delete('/:id', authorize(ROLES.ADMIN), deleteVertical);

export default router;
