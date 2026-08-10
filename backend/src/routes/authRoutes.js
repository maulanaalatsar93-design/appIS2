import express from 'express';
import { login, getMe, changePassword, logout, getOnlineUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);
router.get('/online', authenticateToken, getOnlineUsers);
router.put('/change-password', authenticateToken, changePassword);

export default router;
