import fs from 'fs';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const content = fs.readFileSync('../Project/EquipmentPabrik.md', 'utf8');
  
  const lines = content.split('\n').filter(l => l.trim() && l.includes('\t'));
  const headers = lines[0].split('\t').map(h => h.trim());
  
  // Parse Pabrik  Area  Equipment  Description
  const newData = lines.slice(1).map(l => {
    const parts = l.split('\t');
    return {
      Tempat: parts[0]?.trim() || "",
      Area: parts[1]?.trim() || "",
      Equipment: parts[2]?.trim() || "",
      Description: parts[3]?.trim() || ""
    };
  });

  // 1. Insert missing Pabriks to DB
  const newPabriks = [...new Set(newData.map(d => d.Tempat))];
  
  for (const loc of newPabriks) {
    if (!loc) continue;
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
  fs.writeFileSync(equipmentPath, JSON.stringify(newData, null, 2));

  console.log('equipmentData.json updated completely from EquipmentPabrik.md!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
