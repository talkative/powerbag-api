import { Router } from 'express';
import {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  addStorylineToCollection,
  removeStorylineFromCollection,
  publishCollection,
} from '../handlers/collections';

const router = Router();

// Public routes
router.get('/', getCollections);
router.get('/:id', getCollection);

// Protected routes (require authentication)
router.post('/', createCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

// Relationship management routes
router.post('/:collectionId/storylines/:storylineId', addStorylineToCollection);
router.delete(
  '/:collectionId/storylines/:storylineId',
  removeStorylineFromCollection
);

// Publishing routes
router.post('/:id/publish', publishCollection);

export default router;
