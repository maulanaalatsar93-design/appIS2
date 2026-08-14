// Script untuk seed data master jadwal PdM Rotating
// Jalankan: node backend/src/scripts/seedPdmRules.js
// SAFE: menggunakan upsert (tidak duplikasi)

import prisma from '../utils/prisma.js';
const MASTER_RULES = [
  // Pabrik 6 (PPHS & OSBL)
  { code: 'P6-PPHS-ASU-ALL', pabrikNama: 'P6', subArea: 'ASU/ASP ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - DC', recurrence: 'MONTHLY_TWICE', dateFirst: 1, dateSecond: 15 },
  { code: 'P6-PPHS-ASU-MED', pabrikNama: 'P6', subArea: 'ASU/ASP MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 1, dateSecond: 15 },
  { code: 'P6-PPHS-CONV-PROD', pabrikNama: 'P6', subArea: 'CONV. PRODUCT', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - DC', recurrence: 'MONTHLY_TWICE', dateFirst: 1, dateSecond: 15 },
  { code: 'P6-PPHS-CONV-STOR', pabrikNama: 'P6', subArea: 'CONV. STORAGE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - DC', recurrence: 'MONTHLY_TWICE', dateFirst: 1, dateSecond: 15 },
  { code: 'P6-PPHS-CONV-SHIP', pabrikNama: 'P6', subArea: 'CONV. SHIPPING', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 2, dateSecond: 16 },
  { code: 'P6-PPHS-CONV-UBS', pabrikNama: 'P6', subArea: 'CONV. UBS', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 2, dateSecond: 16 },
  { code: 'P6-PPHS-MED', pabrikNama: 'P6', subArea: 'MEDIUM', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 2, dateSecond: 16 },
  { code: 'P6-PPHS-TANK-METH', pabrikNama: 'P6', subArea: 'Tanki Methanol', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - SAP', recurrence: 'MONTHLY_TWICE', dateFirst: 3, dateSecond: 17 },
  { code: 'P6-PPHS-UBS3', pabrikNama: 'P6', subArea: 'UBS 3', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - SAP', recurrence: 'MONTHLY_TWICE', dateFirst: 3, dateSecond: 17 },
  { code: 'P6-PPHS-QAL', pabrikNama: 'P6', subArea: 'QAL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 3, dateSecond: 17 },
  { code: 'P6-PPHS-BSL2', pabrikNama: 'P6', subArea: 'BSL 2', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 3, dateSecond: 17 },
  { code: 'P6-PPHS-UBS4', pabrikNama: 'P6', subArea: 'UBS 4', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 3, dateSecond: 17 },

  // ROTATING-1: PABRIK 6
  { code: 'P6-ROT-UTIL-ALL', pabrikNama: 'P6', subArea: 'UTILITY ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - SAP', recurrence: 'MONTHLY_TWICE', dateFirst: 4, dateSecond: 18 },
  { code: 'P6-ROT-UREA-ALL', pabrikNama: 'P6', subArea: 'UREA ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - SAP', recurrence: 'MONTHLY_TWICE', dateFirst: 4, dateSecond: 18 },
  { code: 'P6-ROT-UTIL-MED', pabrikNama: 'P6', subArea: 'UTILITY MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 5, dateSecond: 19 },
  { code: 'P6-ROT-UREA-MED', pabrikNama: 'P6', subArea: 'UREA MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 5, dateSecond: 19 },
  { code: 'P6-ROT-BBB-ALL', pabrikNama: 'P6', subArea: 'BBB ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - SAP', recurrence: 'MONTHLY_TWICE', dateFirst: 6, dateSecond: 20 },
  { code: 'P6-ROT-BBB-MED', pabrikNama: 'P6', subArea: 'BBB MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 6, dateSecond: 20 },
  { code: 'P6-ROT-CRIT-STG1', pabrikNama: 'P6', subArea: 'CRITICAL STG 1', equipmentCat: 'STG', criticality: 'CRITICAL', taskName: 'Pengukuran PdM Critical', recurrence: 'MONTHLY_ONCE', dateFirst: 7, dateSecond: null },
  { code: 'P6-ROT-CRIT-STG2', pabrikNama: 'P6', subArea: 'CRITICAL STG 2', equipmentCat: 'STG', criticality: 'CRITICAL', taskName: 'Pengukuran PdM Critical', recurrence: 'MONTHLY_ONCE', dateFirst: 7, dateSecond: null },

  // ROTATING-1: PABRIK 2
  { code: 'P2-ROT-UTIL-ALL', pabrikNama: 'P2', subArea: 'UTILITY ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - INSP', recurrence: 'MONTHLY_TWICE', dateFirst: 8, dateSecond: 22 },
  { code: 'P2-ROT-UREA-ALL', pabrikNama: 'P2', subArea: 'UREA ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - INSP', recurrence: 'MONTHLY_TWICE', dateFirst: 8, dateSecond: 22 },
  { code: 'P2-ROT-AMON-ALL', pabrikNama: 'P2', subArea: 'AMONIA ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - SAP', recurrence: 'MONTHLY_TWICE', dateFirst: 8, dateSecond: 22 },
  { code: 'P2-ROT-UTIL-MED', pabrikNama: 'P2', subArea: 'UTILITY MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 9, dateSecond: 23 },
  { code: 'P2-ROT-UREA-MED', pabrikNama: 'P2', subArea: 'UREA MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 9, dateSecond: 23 },
  { code: 'P2-ROT-AMON-MED', pabrikNama: 'P2', subArea: 'AMONIA MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 9, dateSecond: 23 },
  { code: 'P2-ROT-CRIT-GTG', pabrikNama: 'P2', subArea: 'CRITICAL GTG', equipmentCat: 'GTG', criticality: 'CRITICAL', taskName: 'Pengukuran PdM Critical - SAP', recurrence: 'MONTHLY_ONCE', dateFirst: 10, dateSecond: null },
  { code: 'P2-ROT-CRIT-COMP', pabrikNama: 'P2', subArea: 'CRITICAL ALL COMP', equipmentCat: 'ROTATING', criticality: 'CRITICAL', taskName: 'Pengukuran PdM Critical - SAP (105-J INSP)', recurrence: 'MONTHLY_ONCE', dateFirst: 10, dateSecond: null },
  { code: 'P2-ROT-1106-REV', pabrikNama: 'P2', subArea: '1106-NEW EQ. REVAMP', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - SAP', recurrence: 'MONTHLY_TWICE', dateFirst: 11, dateSecond: 24 },

  // ROTATING-1: PABRIK 5
  { code: 'P5-ROT-UTIL-ALL', pabrikNama: 'P5', subArea: 'UTILITY ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - Plt AVP', recurrence: 'MONTHLY_TWICE', dateFirst: 12, dateSecond: 25 },
  { code: 'P5-ROT-UREA-ALL', pabrikNama: 'P5', subArea: 'UREA ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - Plt AVP', recurrence: 'MONTHLY_TWICE', dateFirst: 12, dateSecond: 25 },
  { code: 'P5-ROT-UREAG-ALL', pabrikNama: 'P5', subArea: 'UREA GRANUL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - Plt AVP', recurrence: 'MONTHLY_TWICE', dateFirst: 12, dateSecond: 25 },
  { code: 'P5-ROT-AMON-ALL', pabrikNama: 'P5', subArea: 'AMONIA ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - Plt AVP', recurrence: 'MONTHLY_TWICE', dateFirst: 13, dateSecond: 26 },
  { code: 'P5-ROT-UTIL-MED', pabrikNama: 'P5', subArea: 'UTILITY MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 13, dateSecond: 26 },
  { code: 'P5-ROT-UREA-MED', pabrikNama: 'P5', subArea: 'UREA MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 13, dateSecond: 26 },
  { code: 'P5-ROT-UREAG-MED', pabrikNama: 'P5', subArea: 'UREA GRANUL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 14, dateSecond: 27 },
  { code: 'P5-ROT-AMON-MED', pabrikNama: 'P5', subArea: 'AMONIA MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 14, dateSecond: 27 },
  { code: 'P5-ROT-CRIT-COMP', pabrikNama: 'P5', subArea: 'CRITICAL COMP', equipmentCat: 'ROTATING', criticality: 'CRITICAL', taskName: 'Pengukuran PdM Critical', recurrence: 'MONTHLY_ONCE', dateFirst: 15, dateSecond: null },

  // ROTATING-2: PABRIK 1A
  { code: 'P1A-ROT-UTIL-ALL', pabrikNama: 'P1A', subArea: 'UTILITY ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - insp', recurrence: 'MONTHLY_TWICE', dateFirst: 1, dateSecond: 15 },
  { code: 'P1A-ROT-UREA-ALL', pabrikNama: 'P1A', subArea: 'UREA ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - insp', recurrence: 'MONTHLY_TWICE', dateFirst: 1, dateSecond: 15 },
  { code: 'P1A-ROT-AMON-ALL', pabrikNama: 'P1A', subArea: 'AMONIA ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - insp', recurrence: 'MONTHLY_TWICE', dateFirst: 2, dateSecond: 16 },
  { code: 'P1A-ROT-UTIL-MED', pabrikNama: 'P1A', subArea: 'UTILITY MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 2, dateSecond: 16 },
  { code: 'P1A-ROT-UREA-MED', pabrikNama: 'P1A', subArea: 'UREA MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 3, dateSecond: 17 },
  { code: 'P1A-ROT-AMON-MED', pabrikNama: 'P1A', subArea: 'AMONIA MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 3, dateSecond: 17 },
  { code: 'P1A-ROT-CRIT-COMP', pabrikNama: 'P1A', subArea: 'CRITICAL COMP', equipmentCat: 'ROTATING', criticality: 'CRITICAL', taskName: 'Pengukuran PdM Critical', recurrence: 'MONTHLY_ONCE', dateFirst: 4, dateSecond: null },

  // ROTATING-2: PABRIK 3
  { code: 'P3-ROT-UTIL-ALL', pabrikNama: 'P3', subArea: 'UTILITY ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - DC', recurrence: 'MONTHLY_TWICE', dateFirst: 5, dateSecond: 19 },
  { code: 'P3-ROT-UREA-ALL', pabrikNama: 'P3', subArea: 'UREA ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - dc', recurrence: 'MONTHLY_TWICE', dateFirst: 5, dateSecond: 19 },
  { code: 'P3-ROT-AMON-ALL', pabrikNama: 'P3', subArea: 'AMONIA ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - dc', recurrence: 'MONTHLY_TWICE', dateFirst: 6, dateSecond: 20 },
  { code: 'P3-ROT-UTIL-MED', pabrikNama: 'P3', subArea: 'UTILITY MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 6, dateSecond: 20 },
  { code: 'P3-ROT-UREA-MED', pabrikNama: 'P3', subArea: 'UREA MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 7, dateSecond: 21 },
  { code: 'P3-ROT-AMON-MED', pabrikNama: 'P3', subArea: 'AMONIA MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 7, dateSecond: 21 },
  { code: 'P3-ROT-CRIT-GTG', pabrikNama: 'P3', subArea: 'CRITICAL GTG', equipmentCat: 'GTG', criticality: 'CRITICAL', taskName: 'Pengukuran PdM Critical - DC', recurrence: 'MONTHLY_ONCE', dateFirst: 8, dateSecond: null },
  { code: 'P3-ROT-CRIT-COMP', pabrikNama: 'P3', subArea: 'CRITICAL COMP', equipmentCat: 'ROTATING', criticality: 'CRITICAL', taskName: 'Pengukuran PdM Critical', recurrence: 'MONTHLY_ONCE', dateFirst: 8, dateSecond: null },

  // ROTATING-2: PABRIK 4
  { code: 'P4-ROT-UTIL-ALL', pabrikNama: 'P4', subArea: 'UTILITY ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - DC', recurrence: 'MONTHLY_TWICE', dateFirst: 9, dateSecond: 23 },
  { code: 'P4-ROT-UREA-ALL', pabrikNama: 'P4', subArea: 'UREA ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - INSP', recurrence: 'MONTHLY_TWICE', dateFirst: 9, dateSecond: 23 },
  { code: 'P4-ROT-AMON-ALL', pabrikNama: 'P4', subArea: 'AMONIA ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - INSP', recurrence: 'MONTHLY_TWICE', dateFirst: 10, dateSecond: 24 },
  { code: 'P4-ROT-UTIL-MED', pabrikNama: 'P4', subArea: 'UTILITY MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 10, dateSecond: 24 },
  { code: 'P4-ROT-UREA-MED', pabrikNama: 'P4', subArea: 'UREA MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 11, dateSecond: 25 },
  { code: 'P4-ROT-AMON-MED', pabrikNama: 'P4', subArea: 'AMONIA MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 11, dateSecond: 25 },
  { code: 'P4-ROT-CRIT-GTG', pabrikNama: 'P4', subArea: 'CRITICAL - GTG', equipmentCat: 'GTG', criticality: 'CRITICAL', taskName: 'Pengukuran PdM Critical', recurrence: 'MONTHLY_ONCE', dateFirst: 12, dateSecond: null },
  { code: 'P4-ROT-CRIT-COMP', pabrikNama: 'P4', subArea: 'CRITICAL COMP', equipmentCat: 'ROTATING', criticality: 'CRITICAL', taskName: 'Pengukuran PdM Critical', recurrence: 'MONTHLY_ONCE', dateFirst: 12, dateSecond: null },

  // ROTATING-2: PABRIK 7
  { code: 'P7-ROT-NPK-F1-ALL', pabrikNama: 'P7', subArea: 'NPK F1 ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - DC', recurrence: 'MONTHLY_TWICE', dateFirst: 13, dateSecond: 26 },
  { code: 'P7-ROT-NPK-F2-ALL', pabrikNama: 'P7', subArea: 'NPK F2 ALL', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM - DC', recurrence: 'MONTHLY_TWICE', dateFirst: 13, dateSecond: 26 },
  { code: 'P7-ROT-NPK-F1-MED', pabrikNama: 'P7', subArea: 'NPK F1 MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 14, dateSecond: 27 },
  { code: 'P7-ROT-NPK-F2-MED', pabrikNama: 'P7', subArea: 'NPK F2 MED', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM', recurrence: 'MONTHLY_TWICE', dateFirst: 14, dateSecond: 27 },
];

async function main() {
  console.log('🌱 Seeding PdM master schedule rules...');
  
  // Ambil semua pabrik
  const pabriks = await prisma.pabrik.findMany();
  const pabrikMap = {};
  pabriks.forEach(p => { pabrikMap[p.nama_pabrik] = p.id; });
  
  console.log('📦 Pabrik ditemukan:', Object.keys(pabrikMap).join(', '));
  
  let created = 0, skipped = 0;
  
  for (const rule of MASTER_RULES) {
    const pabrikId = pabrikMap[rule.pabrikNama];
    if (!pabrikId) {
      console.warn(`⚠️  Pabrik tidak ditemukan: "${rule.pabrikNama}" — skip rule ${rule.code}`);
      skipped++;
      continue;
    }
    
    await prisma.pdmScheduleRule.upsert({
      where: { code: rule.code },
      update: {
        subArea: rule.subArea,
        equipmentCat: rule.equipmentCat,
        criticality: rule.criticality,
        taskName: rule.taskName,
        recurrence: rule.recurrence,
        dateFirst: rule.dateFirst,
        dateSecond: rule.dateSecond,
        isActive: true,
      },
      create: {
        code: rule.code,
        pabrik_id: pabrikId,
        subArea: rule.subArea,
        equipmentCat: rule.equipmentCat,
        criticality: rule.criticality,
        taskName: rule.taskName,
        recurrence: rule.recurrence,
        dateFirst: rule.dateFirst,
        dateSecond: rule.dateSecond,
        isActive: true,
      },
    });
    console.log(`✅ ${rule.code}`);
    created++;
  }
  
  console.log(`\n✨ Selesai! ${created} rules di-upsert, ${skipped} diskip.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
