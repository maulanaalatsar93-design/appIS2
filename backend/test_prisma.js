import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const pphsKeywords = ['ASU', 'ASP', 'CONVEYOR', 'TANKI', 'UBS', 'QAL', 'BSL', 'PPHS', 'OSBL'];
  
  const rules = await prisma.pdmScheduleRule.findMany({
    where: {
      pabrik_id: 6,
      AND: pphsKeywords.map(kw => ({ NOT: { subArea: { contains: kw, mode: 'insensitive' } } }))
    },
    select: { subArea: true }
  });
  console.log("NOT PPHS:", [...new Set(rules.map(r => r.subArea))]);

  const pphsRules = await prisma.pdmScheduleRule.findMany({
    where: {
      pabrik_id: 6,
      OR: pphsKeywords.map(kw => ({ subArea: { contains: kw, mode: 'insensitive' } }))
    },
    select: { subArea: true }
  });
  console.log("PPHS:", [...new Set(pphsRules.map(r => r.subArea))]);
}
main().finally(() => prisma.$disconnect());
