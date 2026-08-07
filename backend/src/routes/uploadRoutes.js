import express from 'express';
import multer from 'multer';
import { uploadWorkOrders, uploadRecommendations, clearWorkOrders, clearRecommendations, getUploadHistory } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import fs from 'fs';

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Role can be checked here, but let's just authenticate for now
router.post('/workorders', authenticateToken, upload.single('file'), uploadWorkOrders);
router.post('/recommendations', authenticateToken, upload.single('file'), uploadRecommendations);

router.delete('/workorders', authenticateToken, clearWorkOrders);
router.delete('/recommendations', authenticateToken, clearRecommendations);

router.get('/history', authenticateToken, getUploadHistory);

export default router;
