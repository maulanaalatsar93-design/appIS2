import express from 'express';
import { getWorkOrders, getWorkOrderById } from '../controllers/workOrderController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/workorders (with pagination, filter, search)
router.get('/', optionalAuth, getWorkOrders);

// GET /api/workorders/:id
router.get('/:id', optionalAuth, getWorkOrderById);

export default router;
