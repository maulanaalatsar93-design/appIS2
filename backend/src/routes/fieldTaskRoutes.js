import express from 'express';
import { 
  getAllTasks, 
  getMyTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask, 
  updatePic,
  addTaskLog,
  addMember,
  removeMember,
  addLogAdvice,
  addParticipantToLog,
  removeParticipantFromLog
} from '../controllers/fieldTaskController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getAllTasks);
router.get('/my', optionalAuth, getMyTasks);
router.get('/:id', optionalAuth, getTaskById);

router.post('/', authenticate, createTask);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

router.post('/:id/log', authenticate, addTaskLog);
router.post('/:id/members', authenticate, addMember);
router.delete('/:id/members/:mpId', authenticate, removeMember);
router.put('/:id/pic', authenticate, updatePic);

router.put('/logs/:logId/advice', authenticate, addLogAdvice);
router.post('/logs/:logId/participants', authenticate, addParticipantToLog);
router.delete('/logs/:logId/participants/:mpId', authenticate, removeParticipantFromLog);

export default router;
