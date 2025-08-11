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

// GET /storylines - Get all storylines with optional filtering
router.get('/', getStoryLines);

// GET /storylines/:title - Get specific storyline by title
router.get('/:title', getStoryLine);

// POST /storylines - Create or update a single storyline
router.post('/', updateOrCreateStoryLine);

// PUT /storylines - Batch create or update storylines
router.put('/', updateOrCreateStoryLines);

// DELETE /storylines/:id - Delete specific storyline by ID
router.delete('/:id', deleteStoryLine);

// DELETE /storylines - Delete all storylines
router.delete('/', deleteStoryLines);

// GET /storylines/system/updates - Check if updates are available
router.get('/system/updates', checkIfUpdateAvailable);

// POST /storylines/:title/publish - Publish specific storyline
router.post('/:title/publish', publishStoryLine);

// POST /storylines/publish/all - Publish all storylines
router.post('/publish/all', publishStoryLines);

export default router;
