import express from 'express';
import {
  getAllSertifikasi,
  createSertifikasi,
  updateSertifikasi,
  deleteSertifikasi,
  ignoreExpiredSertifikasi,
  approveSertifikasi,
  rejectSertifikasi
} from '../controllers/sertifikasiController.js';
import { authenticateToken, optionalAuth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for Sertifikasi
router.get('/', optionalAuth, getAllSertifikasi);
router.post('/', authenticateToken, createSertifikasi);
router.put('/:id', authenticateToken, updateSertifikasi);
router.delete('/:id', authenticateToken, authorize(['admin', 'vp', 'manager']), deleteSertifikasi);
router.put('/:id/ignore-expired', authenticateToken, authorize(['admin', 'vp', 'manager']), ignoreExpiredSertifikasi);

// Approval Routes
router.put('/:id/approve', authenticateToken, authorize(['admin', 'vp']), approveSertifikasi);
router.put('/:id/reject', authenticateToken, authorize(['admin', 'vp']), rejectSertifikasi);

export default router;
