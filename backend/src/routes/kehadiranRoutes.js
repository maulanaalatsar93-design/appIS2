import express from 'express';
import { getKehadiran, createKehadiran, deleteKehadiran } from '../controllers/kehadiranController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getKehadiran);
router.post('/', protect, createKehadiran);
router.delete('/:id', protect, deleteKehadiran);

export default router;
