import prisma from '../utils/prisma.js';

async function main() {
  console.log('🗑️  Deleting all PdM master schedule data...');
  
  await prisma.pdmCrossDelegation.deleteMany();
  await prisma.pdmWorkflowLog.deleteMany();
  await prisma.pdmPicHistory.deleteMany();
  await prisma.pdmDailyActivity.deleteMany();
  await prisma.pdmScheduleOccurrence.deleteMany();
  await prisma.pdmRuleMonthlyPic.deleteMany();
  await prisma.pdmScheduleRule.deleteMany();
  
  console.log('✅ All PdM master schedule data deleted.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
