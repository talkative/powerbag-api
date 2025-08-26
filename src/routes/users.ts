import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  loginUser,
  deleteUser,
  checkEmailExists,
  sendTotpEmail,
} from '../handlers/users';

const router = Router();

router.post('/', createUser); // User registration
router.post('/send-totp', sendTotpEmail);
router.post('/login', loginUser); // User login
router.get('/check-email/:email', checkEmailExists); // Check if email exists
router.get('/', getUsers);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);

export default router;
