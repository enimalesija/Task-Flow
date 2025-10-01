import { Router } from 'express';
import { signup, login, profile, refresh, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, profile);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);

export default router;
