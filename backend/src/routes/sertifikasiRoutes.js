import express from 'express';
import {
  getAllSertifikasi,
  createSertifikasi,
  updateSertifikasi,
  deleteSertifikasi,
  deleteSertifikasi,
  ignoreExpiredSertifikasi,
  approveSertifikasi,
  rejectSertifikasi
} from '../controllers/sertifikasiController.js';
import { authenticateToken, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Routes for Sertifikasi
router.get('/', getAllSertifikasi);
router.post('/', createSertifikasi);
router.put('/:id', updateSertifikasi);
router.delete('/:id', authorize(['admin', 'vp', 'manager']), deleteSertifikasi);
router.put('/:id/ignore-expired', authorize(['admin', 'vp', 'manager']), ignoreExpiredSertifikasi);

// Approval Routes
router.put('/:id/approve', authorize(['admin', 'vp']), approveSertifikasi);
router.put('/:id/reject', authorize(['admin', 'vp']), rejectSertifikasi);

export default router;
