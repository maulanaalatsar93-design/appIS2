import express from 'express';
const router = express.Router();
import { getDailyTasks, getActiveTasks, createDailyTask, updateDailyTask, deleteDailyTask, addTaskLog, updateTaskStatus } from '../controllers/dailyTaskController.js';
import { authenticateToken as verifyToken } from '../middleware/authMiddleware.js';

// GET  /api/daily-tasks/active  — list "In Progress" tasks for active user
router.get('/active', verifyToken, getActiveTasks);

// GET  /api/daily-tasks         — list dengan filter bulan/tahun/area
router.get('/',     verifyToken, getDailyTasks);

// POST /api/daily-tasks         — tambah entry baru
router.post('/',    verifyToken, createDailyTask);

// POST /api/daily-tasks/:id/log — tambah log waktu ke task aktif
router.post('/:id/log', verifyToken, addTaskLog);

// PUT  /api/daily-tasks/:id/status — ubah status task aktif
router.put('/:id/status', verifyToken, updateTaskStatus);

// PUT  /api/daily-tasks/:id     — edit entry
router.put('/:id',  verifyToken, updateDailyTask);

// DELETE /api/daily-tasks/:id   — hapus (Admin only)
router.delete('/:id', verifyToken, deleteDailyTask);

export default router;
