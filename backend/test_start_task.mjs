import { PrismaClient } from '@prisma/client';
import { startTask } from './src/controllers/pdmScheduleController.js';

const prisma = new PrismaClient();

async function run() {
  const req = {
    params: { id: '29' },
    body: { activityNote: 'test' },
    user: { role: 'admin', man_power_id: 1 } // Admin
  };
  
  const res = {
    status: (code) => { console.log('STATUS:', code); return res; },
    json: (data) => { console.log('JSON:', data); return res; }
  };
  
  await startTask(req, res);
  prisma.$disconnect();
}
run();
