import express from 'express';
import {
  createUser,
  bulkCreateUsers,
  listUsers,
  getUserById,
  updateUser,
  resetPassword
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  listUsersSchema
} from '../validators/user.validator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.post('/', validate(createUserSchema), createUser);
router.post('/bulk', bulkCreateUsers);
router.get('/', validate(listUsersSchema), listUsers);
router.get('/:id', getUserById);
router.put('/:id', validate(updateUserSchema), updateUser);
router.post('/:id/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
