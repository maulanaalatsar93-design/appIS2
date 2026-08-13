import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function logWorkflow(occurrenceId, fromStage, toStage, action, actorId, notes, tx = prisma) {
  return tx.pdmWorkflowLog.create({
    data: { occurrenceId, fromStage, toStage, action, actorId, notes }
  });
}

async function test() {
  try {
    const occId = 42;
    const now = new Date();
    const ops = [];
    ops.push(
      prisma.pdmScheduleOccurrence.update({
        where: { id: occId },
        data: {
          workflowStage: 'ANALYSIS',
          dcFinishedAt: now,
          status: 'ASSIGNED',
          assignedToId: 1,
          totalHoldMinutes: { increment: 0 }
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
