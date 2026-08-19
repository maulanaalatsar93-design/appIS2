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
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Semua rute wajib login
router.use(authenticate);

router.get('/', getAllTasks);
router.get('/my', getMyTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

router.post('/:id/log', addTaskLog);
router.post('/:id/members', addMember);
router.delete('/:id/members/:mpId', removeMember);
router.put('/:id/pic', updatePic);

router.put('/logs/:logId/advice', addLogAdvice);
router.post('/logs/:logId/participants', addParticipantToLog);
router.delete('/logs/:logId/participants/:mpId', removeParticipantFromLog);

export default router;
