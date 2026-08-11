import express from 'express';
const router = express.Router();
import * as pdm from '../controllers/pdmScheduleController.js';
import { authenticateToken as verifyToken } from '../middleware/authMiddleware.js';

// ── Master Rules ─────────────────────────────────────────────
router.get('/rules',       verifyToken, pdm.getRules);
router.post('/rules',      verifyToken, pdm.createRule);
router.put('/rules/:id',   verifyToken, pdm.updateRule);
router.delete('/rules/:id',verifyToken, pdm.deleteRule);

// ── Generate ─────────────────────────────────────────────────
router.post('/generate', verifyToken, pdm.generateMonthlySchedule);

// ── Query Occurrences ────────────────────────────────────────
router.get('/occurrences', verifyToken, pdm.getOccurrences);
router.get('/my-tasks',    verifyToken, pdm.getMyTasks);
router.get('/job-board',   verifyToken, pdm.getJobBoard);

// ── Status Transitions ───────────────────────────────────────
router.post('/occurrences/:id/claim',    verifyToken, pdm.claimTask);
router.post('/occurrences/:id/start',    verifyToken, pdm.startTask);
router.post('/occurrences/:id/hold',     verifyToken, pdm.holdTask);
router.post('/occurrences/:id/complete', verifyToken, pdm.completeTask);
router.post('/occurrences/:id/cancel',   verifyToken, pdm.cancelTask);
router.post('/occurrences/:id/reassign', verifyToken, pdm.reassignPic);

// ── PIC History ──────────────────────────────────────────────
router.get('/occurrences/:id/history', verifyToken, pdm.getPicHistory);

// ── Monthly PIC Override ─────────────────────────────────────
router.post('/monthly-pic', verifyToken, pdm.setMonthlyPicOverride);

// ── Dashboard Stats ──────────────────────────────────────────
router.get('/dashboard-stats',      verifyToken, pdm.getDashboardStats);
router.get('/completion-by-pabrik', verifyToken, pdm.getCompletionByPabrik);

export default router;

