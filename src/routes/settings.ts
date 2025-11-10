import { Router } from 'express';

import {
  getSettings,
  getPublicSettings,
  updateSetting,
  getSetting,
} from '../handlers/settings';

const router = Router();

// Public routes
router.get('/public', getPublicSettings);

// Protected routes
router.get('/', getSettings);
router.get('/:key', getSetting);
router.put('/', updateSetting);

export default router;
