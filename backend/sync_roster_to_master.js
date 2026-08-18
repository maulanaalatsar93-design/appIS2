import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai sinkronisasi Roster (PdmRuleMonthlyPic) ke Master Schedule (PdmScheduleRule)...");
  
  // Ambil semua override roster yang ada (misal ambil yang terbaru / bulan ini)
  const overrides = await prisma.pdmRuleMonthlyPic.findMany({
    orderBy: [
      { year: 'desc' },
      { month: 'desc' }
    ]
  });
  
  // Kita kelompokkan per ruleId, ambil yang paling baru saja (karena diurutkan desc)
  const ruleToOverride = {};
  for (const ov of overrides) {
    if (!ruleToOverride[ov.ruleId]) {
      ruleToOverride[ov.ruleId] = ov;
    }
  }
  
  let updatedCount = 0;
  for (const ruleId in ruleToOverride) {
    const ov = ruleToOverride[ruleId];
    
    // Siapkan array dari roster
    const picIds = ov.picIds || [];
    const dataCollectorIds = ov.dataCollectorIds || [];
    const gtgDataCollectorIds = ov.gtgDataCollectorIds || [];
    
    // Update rule
    await prisma.pdmScheduleRule.update({
      where: { id: parseInt(ruleId) },
      data: {
        defaultPicIds: picIds,
        defaultDataCollectorIds: dataCollectorIds,
        defaultGtgDataCollectorIds: gtgDataCollectorIds,
        // Jika hanya ada 1 pic, set ke defaultPicId untuk backward compatibility generate jadwal
        defaultPicId: picIds.length === 1 ? picIds[0] : null
      }
    });
    
    updatedCount++;
    console.log(`Updated Rule ID ${ruleId}: defaultPicIds=[${picIds}], defaultDataCollectorIds=[${dataCollectorIds}]`);
  }
  
  console.log(`\nSelesai! Berhasil mengupdate ${updatedCount} Master Schedule Rules.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
