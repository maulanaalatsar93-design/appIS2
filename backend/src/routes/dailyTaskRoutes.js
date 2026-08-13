import express from 'express';
const router = express.Router();
import { getDailyTasks, createDailyTask, updateDailyTask, deleteDailyTask } from '../controllers/dailyTaskController.js';
import { authenticateToken as verifyToken } from '../middleware/authMiddleware.js';

// GET  /api/daily-tasks         — list dengan filter bulan/tahun/area
router.get('/',     verifyToken, getDailyTasks);

// POST /api/daily-tasks         — tambah entry baru
router.post('/',    verifyToken, createDailyTask);

// PUT  /api/daily-tasks/:id     — edit entry
router.put('/:id',  verifyToken, updateDailyTask);

// DELETE /api/daily-tasks/:id   — hapus (Admin only)
router.delete('/:id', verifyToken, deleteDailyTask);

export default router;
