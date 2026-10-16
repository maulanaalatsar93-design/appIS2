import express from 'express';
import { getRekomendasi, getRekomendasiById } from '../controllers/rekomendasiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/recommendations (with pagination, filter, search)
router.get('/', optionalAuth, getRekomendasi);

// GET /api/recommendations/:id
router.get('/:id', optionalAuth, getRekomendasiById);

export default router;
