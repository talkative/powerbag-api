import { Router } from 'express';
import { getUsers, getUserById, createUser } from '../handlers/users';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);

router.post('/', createUser); // Assuming createUser is defined in handlers/users.ts

export default router;
