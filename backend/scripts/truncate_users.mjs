import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE app_users CASCADE;');
  console.log('Truncated app_users');
}
main().finally(() => prisma.$disconnect());
