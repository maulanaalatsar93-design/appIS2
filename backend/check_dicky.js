import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findFirst({ where: { name: { contains: 'dicky', mode: 'insensitive' } } }).then(console.log).finally(() => prisma.$disconnect());
