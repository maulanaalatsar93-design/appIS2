import express from 'express';
import { getDashboardSummary, getManpowerList, getNotifications, getPabrikList } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/summary
router.get('/summary', getDashboardSummary);

// GET /api/dashboard/manpower
router.get('/manpower', getManpowerList);

// GET /api/dashboard/notifications
router.get('/notifications', authenticateToken, getNotifications);

// GET /api/dashboard/pabrik
router.get('/pabrik', authenticateToken, getPabrikList);

export default router;
