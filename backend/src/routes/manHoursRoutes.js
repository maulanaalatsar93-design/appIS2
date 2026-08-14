import express from 'express';
const router = express.Router();
import { getManHours, getManHoursSummary, updateInlineManHours } from '../controllers/manHoursController.js';
import { authenticateToken as verifyToken } from '../middleware/authMiddleware.js';

// GET /api/man-hours — Daftar lengkap man hours dengan filter
router.get('/', verifyToken, getManHours);

// GET /api/man-hours/summary — Aggregat & KPI man hours
router.get('/summary', verifyToken, getManHoursSummary);

// PUT /api/man-hours/inline/:id — Inline edit waktu mulai & selesai
router.put('/inline/:id', verifyToken, updateInlineManHours);

export default router;
