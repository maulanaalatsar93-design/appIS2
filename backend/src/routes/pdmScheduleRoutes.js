import express from 'express';
const router = express.Router();
import * as pdm from '../controllers/pdmScheduleController.js';
import * as wf from '../controllers/pdmWorkflowController.js';
import * as ac from '../controllers/pdmAccessControl.js';
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

// ── Status Transitions (Legacy) ──────────────────────────────
router.post('/occurrences/:id/claim',    verifyToken, pdm.claimTask);
router.post('/occurrences/:id/start',    verifyToken, pdm.startTask);
router.post('/occurrences/:id/hold',     verifyToken, pdm.holdTask);
router.post('/occurrences/:id/complete', verifyToken, pdm.completeTask);
router.post('/occurrences/:id/cancel',   verifyToken, pdm.cancelTask);
router.post('/occurrences/:id/reassign', verifyToken, pdm.reassignPic);

// ── 4-Stage Workflow Transitions ────────────────────────────
router.post('/occurrences/:id/finish-dc',          verifyToken, wf.finishDataCollection);
router.post('/occurrences/:id/start-analysis',     verifyToken, wf.startAnalysis);
router.post('/occurrences/:id/finish-analysis',    verifyToken, wf.finishAnalysis);
router.post('/occurrences/:id/avp-approve',        verifyToken, wf.avpApprove);
router.post('/occurrences/:id/avp-reject',         verifyToken, wf.avpReject);
router.post('/occurrences/:id/sap-upload',         verifyToken, wf.markSapUploaded);
router.post('/occurrences/:id/workflow-hold',      verifyToken, wf.holdWorkflowTask);
router.post('/occurrences/:id/workflow-resume',    verifyToken, wf.resumeWorkflowTask);
router.patch('/occurrences/:id/assign-personnel',  verifyToken, wf.assignWorkflowPersonnel);

// ── Workflow Queries ─────────────────────────────────────────
router.get('/workflow-tasks',                      verifyToken, wf.getMyWorkflowTasks);
router.get('/area-dashboard',                      verifyToken, wf.getAreaDashboard);
router.get('/occurrences/:id/workflow-logs',       verifyToken, wf.getWorkflowLogs);

// ── Cross-Area Delegation ────────────────────────────────────
router.post('/occurrences/:id/delegate',                 verifyToken, ac.createDelegation);
router.get('/occurrences/:id/delegations',               verifyToken, ac.getDelegations);
router.delete('/occurrences/:id/delegate/:delegationId', verifyToken, ac.revokeDelegation);

// ── PIC History ──────────────────────────────────────────────
router.get('/occurrences/:id/history', verifyToken, pdm.getPicHistory);

// ── Monthly PIC Override ─────────────────────────────────────
router.post('/monthly-pic', verifyToken, pdm.setMonthlyPicOverride);

// ── Dashboard Stats ──────────────────────────────────────────
router.get('/dashboard-stats',      verifyToken, pdm.getDashboardStats);
router.get('/completion-by-pabrik', verifyToken, pdm.getCompletionByPabrik);

// ── Roster PIC ───────────────────────────────────────────────
router.get('/roster',               verifyToken, pdm.getRoster);
router.post('/monthly-pic/bulk',    verifyToken, pdm.setMonthlyPicBulk);

// ── Admin: Manpower Sub-Area Management ─────────────────────
router.get('/admin/manpower/areas',          verifyToken, ac.getManpowerAreas);
router.put('/admin/manpower/:mpId/sub-area', verifyToken, ac.updateManpowerSubArea);

export default router;
