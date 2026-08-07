import express from 'express';
import {
  getAllSertifikasi,
  createSertifikasi,
  updateSertifikasi,
  deleteSertifikasi
} from '../controllers/sertifikasiController.js';
import { authenticateToken, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Routes for Sertifikasi
router.get('/', getAllSertifikasi);
router.post('/', authorize(['admin', 'vp', 'manager']), createSertifikasi);
router.put('/:id', authorize(['admin', 'vp', 'manager']), updateSertifikasi);
router.delete('/:id', authorize(['admin', 'vp', 'manager']), deleteSertifikasi);

export default router;
