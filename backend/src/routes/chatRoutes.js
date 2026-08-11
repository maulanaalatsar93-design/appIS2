import express from 'express';
import { sendMessage, getConversation, getUnreadCount } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send', authenticateToken, sendMessage);
router.get('/unread', authenticateToken, getUnreadCount);
router.get('/:userId', authenticateToken, getConversation);

export default router;
