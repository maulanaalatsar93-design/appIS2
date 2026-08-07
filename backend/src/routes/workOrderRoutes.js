import express from 'express';
import { getWorkOrders, getWorkOrderById } from '../controllers/workOrderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// GET /api/workorders (with pagination, filter, search)
router.get('/', getWorkOrders);

// GET /api/workorders/:id
router.get('/:id', getWorkOrderById);

export default router;
