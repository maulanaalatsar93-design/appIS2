const fs = require('fs');
const path = require('path');

const files = [
  'src/controllers/sertifikasiController.js',
  'src/controllers/pdmWorkflowController.js',
  'src/controllers/pdmAccessControl.js',
  'src/controllers/manHoursController.js',
  'src/controllers/pdmScheduleController.js',
  'src/controllers/kehadiranController.js',
  'src/controllers/dailyTaskController.js',
  'src/middleware/authMiddleware.js',
  'src/scripts/seedPdmRules.js',
  'src/scripts/queryPabrik.js',
  'src/controllers/importController.js',
  'src/controllers/rekomendasiController.js',
  'src/controllers/workOrderController.js',
  'src/controllers/dashboardController.js',
  'src/controllers/kpiController.js',
  'src/controllers/manPowerController.js',
  'src/controllers/manpowerPlanningController.js',
  'src/controllers/uploadController.js',
  'src/controllers/authController.js',
  'src/controllers/wpemMonitorController.js',
  'src/controllers/wpMyCubeController.js',
  'src/controllers/wpProgramsController.js'
];

files.forEach(relPath => {
  const fullPath = path.join('d:/appIS2/backend', relPath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;
  
  const regex = /import\s*\{\s*PrismaClient\s*\}\s*from\s*['"]@prisma\/client['"];?\s*const\s*prisma\s*=\s*new\s*PrismaClient\(\);\s*/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, "import prisma from '../utils/prisma.js';\n");
    fs.writeFileSync(fullPath, content);
    console.log('Updated: ' + relPath);
  }
});
