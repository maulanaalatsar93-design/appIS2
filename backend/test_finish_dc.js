import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const id = 1; // any valid ID to just test if the query compiles
  try {
    const occ = await prisma.pdmScheduleOccurrence.findUnique({
      where: { id: parseInt(id) },
      include: {
        rule: { include: { pabrik: true } },
        analyst: true,
      }
    });
    console.log("Query success! Found:", !!occ);
  } catch (err) {
    console.error("Query failed:", err.message);
  }
}

test().finally(() => prisma.$disconnect());
