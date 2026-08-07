import express from 'express';
import { getDashboardSummary, getManpowerList, getNotifications } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/summary
router.get('/summary', getDashboardSummary);

// GET /api/dashboard/manpower
router.get('/manpower', getManpowerList);

// GET /api/dashboard/notifications
router.get('/notifications', authenticateToken, getNotifications);

export default router;
