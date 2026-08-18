import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const rules = await prisma.pdmScheduleRule.findMany({ include: { pabrik: true } });
  const analysts = await prisma.user.findMany({ where: { role: 'analyst' }, include: { man_power: true } });
  let updated = 0;
  for (const r of rules) {
    let matchedMpId = null;
    const occArea = (r.pabrik?.nama_pabrik + ' ' + (r.subArea || '')).trim().toLowerCase();
    const isOccPphs = ['pphs', 'osbl', 'conveyor ubs', 'conveyor bsl', 'batubara boiler', 'batu bara boiler'].some(kw => occArea.includes(kw));
    for (const a of analysts) {
      if (!a.man_power) continue;
      const mArea = (a.man_power.sub_area || '').toLowerCase();
      const isMPPphs = ['pphs', 'osbl'].some(kw => mArea.includes(kw));
      if (isOccPphs && isMPPphs && occArea.includes('6') && mArea.includes('6')) {
        matchedMpId = a.man_power_id;
        break;
      }
      if (mArea === occArea) {
        matchedMpId = a.man_power_id;
        break;
      }
    }
    if (matchedMpId && r.defaultPicId !== matchedMpId) {
      await prisma.pdmScheduleRule.update({ where: { id: r.id }, data: { defaultPicId: matchedMpId } });
      updated++;
    }
  }
  console.log('Updated', updated, 'rules');
}
main().catch(console.error).finally(() => prisma.$disconnect());
