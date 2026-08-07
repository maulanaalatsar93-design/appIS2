import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getPlans,
  getPlanById,
  createPlan,
  processApproval,
  checkAvailability,
  getApprovers
} from '../controllers/manpowerPlanController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.get('/availability', checkAvailability);
router.get('/approvers', getApprovers);
router.get('/', getPlans);
router.get('/:id', getPlanById);
router.post('/', createPlan);
router.post('/:id/approval', processApproval);

export default router;
