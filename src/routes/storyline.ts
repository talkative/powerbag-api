import { Router } from 'express';
import {
  getStorylines,
  getStoryline,
  createStoryline,
  updateStoryline,
  deleteStoryline,
  checkIfUpdateAvailable,
  publishStoryline,
  publishStorylines,
  migrateStoryline,
  resolveLocationNames,
} from '../handlers/storyline';

const router = Router();

router.get('/', getStorylines);
router.post('/resolve-locations', resolveLocationNames);
router.get('/:id', getStoryline);

router.post('/migrate/:id', migrateStoryline);

router.post('/', createStoryline);
router.put('/:id', updateStoryline);

router.get('/system/updates', checkIfUpdateAvailable);

router.delete('/:id', deleteStoryline);

router.post('/:title/publish', publishStoryline);
router.post('/publish/all', publishStorylines);

export default router;
