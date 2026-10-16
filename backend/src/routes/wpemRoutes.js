import express from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
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
  getKPI,
  assignPlt,
  getMemberParticipation
} from '../controllers/wpemController.js';

const router = express.Router();

// Availability & Approvers
router.get('/availability', optionalAuth, getAvailability);
router.get('/approvers', optionalAuth, getWPEMApprovers);

// KPI Dashboard & Member Participation
router.get('/kpi', optionalAuth, getKPI);
router.get('/member-participation', optionalAuth, getMemberParticipation);

// My Work Cube (personal items)
router.get('/my-cube', optionalAuth, getMyWorkCube);

// Work Programs
router.get('/programs', optionalAuth, getPrograms);
router.post('/programs', protect, createProgram);
router.get('/programs/:id', optionalAuth, getProgramById);
router.post('/programs/:id/submit', protect, submitProgram);
router.post('/programs/:id/approval', protect, processApproval);
router.post('/programs/:id/vp-approval', protect, vpOverrideApproval); // VP/SuperAdmin override
router.post('/programs/:id/feedback', protect, addProgramFeedback);
router.put('/programs/:id/priority', protect, updateProgramPriority);

// Work Items (under a program)
router.get('/programs/:id/items', optionalAuth, getItems);
router.post('/programs/:id/items', protect, createItem);

// Work Item actions
router.put('/items/:itemId', protect, updateItem);
router.put('/items/:itemId/status', protect, updateItemStatus);
router.put('/items/:itemId/plt', protect, assignPlt);
router.get('/items/:itemId', optionalAuth, getItemDetail);
router.post('/items/:itemId/activity', protect, addActivity);
router.get('/items/:itemId/checklists', optionalAuth, getChecklists);
router.post('/items/:itemId/checklists', protect, createChecklist);
router.put('/checklists/:checklistId', protect, updateChecklist);
router.post('/items/:itemId/review', protect, reviewItem);

export default router;
