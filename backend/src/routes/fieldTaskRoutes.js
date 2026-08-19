import express from 'express';
import { 
  getAllTasks, 
  getMyTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask, 
  addTaskLog, 
  addMember, 
  removeMember, 
  updatePic,
  addLogAdvice
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

export default router;
