import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAvailability,
  getWPEMApprovers,
  getPrograms,
  getProgramById,
  createProgram,
  submitProgram,
  processApproval,
  vpOverrideApproval,
  addProgramFeedback,
  updateProgramPriority,
  getItems,
  createItem,
  updateItem,
  updateItemStatus,
  getItemDetail,
  addActivity,
  getChecklists,
  createChecklist,
  updateChecklist,
  reviewItem,
  getMyWorkCube,
  getKPI
} from '../controllers/wpemController.js';

const router = express.Router();
router.use(protect);

// Availability & Approvers
router.get('/availability', getAvailability);
router.get('/approvers', getWPEMApprovers);

// KPI Dashboard
router.get('/kpi', getKPI);

// My Work Cube (personal items)
router.get('/my-cube', getMyWorkCube);

// Work Programs
router.get('/programs', getPrograms);
router.post('/programs', createProgram);
router.get('/programs/:id', getProgramById);
router.post('/programs/:id/submit', submitProgram);
router.post('/programs/:id/approval', processApproval);
router.post('/programs/:id/vp-approval', vpOverrideApproval); // VP/SuperAdmin override
router.post('/programs/:id/feedback', addProgramFeedback);
router.put('/programs/:id/priority', updateProgramPriority);

// Work Items (under a program)
router.get('/programs/:id/items', getItems);
router.post('/programs/:id/items', createItem);

// Work Item actions
router.put('/items/:itemId', updateItem);
router.put('/items/:itemId/status', updateItemStatus);
router.get('/items/:itemId', getItemDetail);
router.post('/items/:itemId/activity', addActivity);
router.get('/items/:itemId/checklists', getChecklists);
router.post('/items/:itemId/checklists', createChecklist);
router.put('/checklists/:checklistId', updateChecklist);
router.post('/items/:itemId/review', reviewItem);

export default router;
