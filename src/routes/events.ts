import { Router } from 'express';
import { getEvents, createEvents, deleteEvents } from '../handlers/events';

const router = Router();

// GET /events - Get all events
router.get('/', getEvents);

// POST /events - Create new events
router.post('/', createEvents);

// DELETE /events/:id - Delete specific event by ID
router.delete('/:id', deleteEvents);

export default router;
