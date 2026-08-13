import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userSubArea = "P6 PPHS & OSBL";
  let areaFilter = {};
  const match = userSubArea.match(/^(P\d[A-Z]?)\s+(.+)$/i);
  if (match) {
    const pabrikCode = match[1].replace(/^P/i, '');
    areaFilter = { 
      rule: { 
        pabrik: { nama_pabrik: { contains: pabrikCode, mode: 'insensitive' } },
        subArea: { contains: match[2].trim(), mode: 'insensitive' } 
      } 
    };
  }

  const occurrences = await prisma.pdmScheduleOccurrence.findMany({
    where: {
      status: 'SCHEDULED',
      ...areaFilter
    },
    include: {
      rule: {
        include: { pabrik: true }
      }
    }
  });

  console.log("Tasks found:", occurrences.length);
  if (occurrences.length > 0) {
    console.log("Sample task subArea:", occurrences[0].rule.subArea);
    console.log("Sample task pabrik:", occurrences[0].rule.pabrik.nama_pabrik);
  }
}

main().finally(() => prisma.$disconnect());
