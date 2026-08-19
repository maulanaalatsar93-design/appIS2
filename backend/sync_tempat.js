import fs from 'fs';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const content = fs.readFileSync('../Project/Tempat.md', 'utf8');
  
  const newData = content.split('\n').filter(l => l.trim() && l.includes('\t')).map(l => {
    const [pabrik, area] = l.split('\t');
    return {
      pabrik: pabrik.trim(),
      area: area.trim(),
      equipment: "-",
      description: "-"
    };
  });

  // 1. Insert missing Pabriks to DB
  const newPabriks = [...new Set(newData.map(d => d.pabrik))];
  
  for (const loc of newPabriks) {
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
      console.log(`Inserted to DB: ${loc}`);
    }
  }

  // 2. Sync equipmentData.json
  const equipmentPath = '../frontend/src/data/equipmentData.json';
  let currentData = JSON.parse(fs.readFileSync(equipmentPath, 'utf8'));

  // Remove ALL previously added custom non-plant locations to avoid duplicates
  // We'll keep anything that has actual equipment, and just re-add the new Tempat.md
  // Wait, better to just remove all that have equipment="-" and description="-" and their pabrik is in newPabriks
  currentData = currentData.filter(d => !(d.equipment === '-' && d.description === '-' && newPabriks.includes(d.pabrik)));

  const combined = [...currentData, ...newData];
  fs.writeFileSync(equipmentPath, JSON.stringify(combined, null, 2));

  console.log('equipmentData.json updated completely!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
