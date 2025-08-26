import { Router } from 'express';
import { getEvents, createEvents, deleteEvents } from '../handlers/events';

const router = Router();

// Protected routes (use default authentication)
router.get('/', getEvents);
router.post('/', createEvents);
router.delete('/:id', deleteEvents);

export default router;
