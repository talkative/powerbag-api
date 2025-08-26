import { Router } from 'express';
import {
  getStoryLines,
  getStoryLine,
  updateOrCreateStoryLine,
  updateOrCreateStoryLines,
  deleteStoryLine,
  deleteStoryLines,
  checkIfUpdateAvailable,
  publishStoryLine,
  publishStoryLines,
} from '../handlers/storyline';

const router = Router();

router.get('/', getStoryLines);
router.get('/:title', getStoryLine);
router.get('/system/updates', checkIfUpdateAvailable);
router.post('/', updateOrCreateStoryLine);
router.put('/', updateOrCreateStoryLines);
router.delete('/:id', deleteStoryLine);
router.delete('/', deleteStoryLines);
router.post('/:title/publish', publishStoryLine);
router.post('/publish/all', publishStoryLines);

export default router;
