import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const shofwan = await prisma.manPower.findFirst({
    where: { name: { contains: 'Shofwan' } },
    include: {
      absensi: true,
      wp_memberships: { include: { program: true } }
    }
  });
  fs.writeFileSync('shofwan-output.json', JSON.stringify(shofwan, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
