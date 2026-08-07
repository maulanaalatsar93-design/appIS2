import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import workOrderRoutes from './routes/workOrderRoutes.js';
import rekomendasiRoutes from './routes/rekomendasiRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import kehadiranRoutes from './routes/kehadiranRoutes.js';
import manpowerPlanRoutes from './routes/manpowerPlanRoutes.js';
import wpemRoutes from './routes/wpemRoutes.js';
import sertifikasiRoutes from './routes/sertifikasiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/workorders', workOrderRoutes);
app.use('/api/recommendations', rekomendasiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/kehadiran', kehadiranRoutes);
app.use('/api/manpower-plans', manpowerPlanRoutes);
app.use('/api/wpem', wpemRoutes);
app.use('/api/sertifikasi', sertifikasiRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    system: 'ISTEK 2 Backend API',
    timestamp: new Date().toISOString()
  });
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[ISTEK 2] Backend server running on http://localhost:${PORT}`);
  });
}
