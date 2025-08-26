import { Router } from 'express';
import { getInfo, createInfo, updateInfo } from '../handlers/info';

const router = Router();

router.get('/', getInfo);
router.post('/', createInfo);
router.put('/:id', updateInfo);

export default router;
