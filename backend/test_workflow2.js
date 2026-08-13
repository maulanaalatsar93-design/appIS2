import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function logWorkflow(occurrenceId, fromStage, toStage, action, actorId, notes, tx = prisma) {
  return tx.pdmDailyActivity.create({ // Using an existing model for testing
    data: { 
      occurrenceId, 
      workDate: new Date(), 
      startTime: new Date(), 
      activityNote: notes, 
      statusSnapshot: 'COMPLETED' 
    }
  });
}

async function test() {
  try {
    const occId = 1; // Assuming 1 is valid
    const now = new Date();
    const ops = [];
    ops.push(
      prisma.pdmScheduleOccurrence.update({
        where: { id: occId },
        data: {
          status: 'ASSIGNED',
        }
      }),
      logWorkflow(occId, 'DC_COLLECTION', 'ANALYSIS', 'DC_FINISH', 1, "test")
    );
    const updated = await prisma.$transaction(ops);
    console.log("Success:", !!updated);
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

test().finally(() => prisma.$disconnect());
