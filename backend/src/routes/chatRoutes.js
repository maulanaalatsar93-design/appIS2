import express from 'express';
import { sendMessage, getConversation } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send', authenticateToken, sendMessage);
router.get('/:userId', authenticateToken, getConversation);

export default router;
