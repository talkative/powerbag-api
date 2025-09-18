import { Router } from 'express';
import {
  getStorylines,
  getStoryline,
  updateOrCreateStoryline,
  updateOrCreateStorylines,
  deleteStoryline,
  deleteStorylines,
  checkIfUpdateAvailable,
  publishStoryline,
  publishStorylines,
} from '../handlers/storyline';

const router = Router();

router.get('/', getStorylines);
router.get('/:id', getStoryline);
router.get('/system/updates', checkIfUpdateAvailable);
router.post('/', updateOrCreateStoryline);
router.put('/', updateOrCreateStorylines);
router.delete('/:id', deleteStoryline);
router.delete('/', deleteStorylines);
router.post('/:title/publish', publishStoryline);
router.post('/publish/all', publishStorylines);

export default router;
