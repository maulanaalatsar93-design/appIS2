import express from 'express';
import multer from 'multer';
import os from 'os';
import { uploadWorkOrders, uploadRecommendations, clearWorkOrders, clearRecommendations, getUploadHistory } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: os.tmpdir() });

// Role can be checked here, but let's just authenticate for now
router.post('/workorders', authenticateToken, upload.single('file'), uploadWorkOrders);
router.post('/recommendations', authenticateToken, upload.single('file'), uploadRecommendations);

router.delete('/workorders', authenticateToken, clearWorkOrders);
router.delete('/recommendations', authenticateToken, clearRecommendations);

router.get('/history', authenticateToken, getUploadHistory);

export default router;
