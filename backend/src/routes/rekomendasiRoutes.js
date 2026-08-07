import express from 'express';
import { getRekomendasi, getRekomendasiById } from '../controllers/rekomendasiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// GET /api/recommendations (with pagination, filter, search)
router.get('/', getRekomendasi);

// GET /api/recommendations/:id
router.get('/:id', getRekomendasiById);

export default router;
