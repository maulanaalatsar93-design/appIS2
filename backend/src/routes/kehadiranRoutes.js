import express from 'express';
import { getKehadiran, createKehadiran, deleteKehadiran } from '../controllers/kehadiranController.js';

const router = express.Router();

router.get('/', getKehadiran);
router.post('/', createKehadiran);
router.delete('/:id', deleteKehadiran);

export default router;
