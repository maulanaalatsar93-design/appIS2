import express from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import {
  getPlans,
  getPlanById,
  createPlan,
  processApproval,
  checkAvailability,
  getApprovers
} from '../controllers/manpowerPlanController.js';

const router = express.Router();

router.get('/availability', optionalAuth, checkAvailability);
router.get('/approvers', optionalAuth, getApprovers);
router.get('/', optionalAuth, getPlans);
router.get('/:id', optionalAuth, getPlanById);
router.post('/', protect, createPlan);
router.post('/:id/approval', protect, processApproval);

export default router;
