import { Router } from 'express';
import { getInfo, createInfo, updateInfo } from '../handlers/info';

const router = Router();

// GET /info - Get info content
router.get('/', getInfo);

// POST /info - Create new info content
router.post('/', createInfo);

// PUT /info/:id - Update existing info content
router.put('/:id', updateInfo);

export default router;
