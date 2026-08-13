import express from 'express';
const router = express.Router();
import { getManHours, getManHoursSummary } from '../controllers/manHoursController.js';
import { authenticateToken as verifyToken } from '../middleware/authMiddleware.js';

// GET /api/man-hours — Daftar lengkap man hours dengan filter
router.get('/', verifyToken, getManHours);

// GET /api/man-hours/summary — Aggregat & KPI man hours
router.get('/summary', verifyToken, getManHoursSummary);

export default router;
