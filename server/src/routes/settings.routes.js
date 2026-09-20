import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validators/settings.validator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/', getSettings);
router.put('/', validate(updateSettingsSchema), updateSettings);

export default router;
