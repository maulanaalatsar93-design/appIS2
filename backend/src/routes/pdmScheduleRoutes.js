import express from 'express';
const router = express.Router();
import * as pdmScheduleController from '../controllers/pdmScheduleController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; // assuming we have isAdmin or similar, but maybe we just use verifyToken for now

// Route untuk PdmScheduleRule
router.get('/rules', verifyToken, pdmScheduleController.getRules);
router.post('/rules', verifyToken, pdmScheduleController.createRule);
router.put('/rules/:id', verifyToken, pdmScheduleController.updateRule);
router.delete('/rules/:id', verifyToken, pdmScheduleController.deleteRule);

// Route untuk Occurrences / Generate
router.post('/generate', verifyToken, pdmScheduleController.generateMonthlySchedule);
router.get('/occurrences', verifyToken, pdmScheduleController.getOccurrences); // Untuk Job Board / Calendar
router.get('/my-tasks', verifyToken, pdmScheduleController.getMyTasks); // Untuk Task Saya

// Route untuk aksi Task
router.post('/occurrences/:id/claim', verifyToken, pdmScheduleController.claimTask);
router.post('/occurrences/:id/start', verifyToken, pdmScheduleController.startTask);
router.post('/occurrences/:id/hold', verifyToken, pdmScheduleController.holdTask);
router.post('/occurrences/:id/complete', verifyToken, pdmScheduleController.completeTask);
router.post('/occurrences/:id/reassign', verifyToken, pdmScheduleController.reassignTask);

export default router;
