import express from 'express';
import {
  getPerformanceKillers,
  createPerformanceKiller,
  updatePerformanceKiller,
  deletePerformanceKiller
} from '../controllers/performanceKillerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPerformanceKillers)
  .post(protect, authorize('VP', 'AVP', 'Manager', 'Administrator', 'Admin', 'Supervisor', 'staff'), createPerformanceKiller);

router.route('/:id')
  .put(protect, authorize('VP', 'AVP', 'Manager', 'Administrator', 'Admin', 'Supervisor', 'staff'), updatePerformanceKiller)
  .delete(protect, authorize('VP', 'AVP', 'Manager', 'Administrator', 'Admin', 'Supervisor', 'staff'), deletePerformanceKiller);

export default router;
