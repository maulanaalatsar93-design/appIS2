import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const rows = await prisma.pabrik.findMany({ select: { id: true, nama_pabrik: true, kode_pabrik: true } });
console.log(JSON.stringify(rows, null, 2));
await prisma.$disconnect();
