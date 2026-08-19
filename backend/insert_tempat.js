import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const newLocations = [
    'KPI', 'K3', 'Kan. Pusat', 'Kan. Management Vendor', 'ISTEK 2',
    'Workshop Listrik', 'Workshop Permesinan', 'JPP', 'Area Luar Pabrik',
    'Receiving', 'Pemeliharaan'
  ];

  for (const loc of newLocations) {
    // Check if exists
    const existing = await prisma.pabrik.findFirst({ where: { nama_pabrik: loc } });
    if (!existing) {
      const maxIdRecord = await prisma.pabrik.findFirst({ orderBy: { id: 'desc' } });
      const nextId = maxIdRecord ? maxIdRecord.id + 1 : 1;
      
      await prisma.pabrik.create({
        data: {
          id: nextId,
          nama_pabrik: loc,
          kode_pabrik: loc.substring(0, 10).toUpperCase()
        }
      });
      console.log(`Inserted: ${loc}`);
    } else {
      console.log(`Already exists: ${loc}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
