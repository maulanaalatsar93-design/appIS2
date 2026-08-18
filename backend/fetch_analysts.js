import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const analysts = await prisma.user.findMany({ where: { role: 'analyst' }, include: { man_power: true } });
  console.log(JSON.stringify(analysts, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
