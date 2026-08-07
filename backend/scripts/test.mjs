import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const records = await prisma.statusKehadiran.findMany({
    include: { man_power: { include: { divisi: true } } }
  });
  console.log("StatusKehadiran records:");
  console.log(JSON.stringify(records, null, 2));
}

main().finally(() => prisma.$disconnect());
