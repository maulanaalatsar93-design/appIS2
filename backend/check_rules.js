import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const rules = await prisma.pdmScheduleRule.findMany({ include: { defaultPic: true }});
  console.log(JSON.stringify(rules.slice(0, 2), null, 2));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
