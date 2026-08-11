// Script untuk seed data master jadwal PdM Rotating
// Jalankan: node backend/src/scripts/seedPdmRules.js
// SAFE: menggunakan upsert (tidak duplikasi)

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const MASTER_RULES = [
  // Pabrik 1A – Rotating
  { code: 'P1A-ROT-NC-AMMONIA',    pabrikNama: 'P1A', subArea: 'Ammonia',        equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 1,  dateSecond: 12 },
  { code: 'P1A-ROT-NC-UTIL-UREA',  pabrikNama: 'P1A', subArea: 'Utility & Urea', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 1,  dateSecond: 12 },
  { code: 'P1A-ROT-CRIT',          pabrikNama: 'P1A', subArea: 'Compressor',     equipmentCat: 'ROTATING', criticality: 'CRITICAL',     taskName: 'Pengukuran PdM Critical',     recurrence: 'MONTHLY_ONCE',  dateFirst: 2,  dateSecond: null },
  
  // Pabrik 2 – Rotating
  { code: 'P2-ROT-NC-AMMONIA',     pabrikNama: 'P2', subArea: 'Ammonia',    equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 4,  dateSecond: 14 },
  { code: 'P2-ROT-NC-UREA',        pabrikNama: 'P2', subArea: 'Urea',       equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 4,  dateSecond: 14 },
  { code: 'P2-ROT-NC-UTILITY',     pabrikNama: 'P2', subArea: 'Utility',    equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 4,  dateSecond: 14 },
  { code: 'P2-GTG',                pabrikNama: 'P2', subArea: 'GTG P2',     equipmentCat: 'GTG',      criticality: 'CRITICAL',     taskName: 'Pengukuran PdM Critical',     recurrence: 'MONTHLY_ONCE',  dateFirst: 6,  dateSecond: null },
  { code: 'P2-ROT-CRIT',           pabrikNama: 'P2', subArea: 'Compressor', equipmentCat: 'ROTATING', criticality: 'CRITICAL',     taskName: 'Pengukuran PdM Critical',     recurrence: 'MONTHLY_ONCE',  dateFirst: 5,  dateSecond: null },

  // Pabrik 3 – Rotating
  { code: 'P3-ROT-NC-AMMONIA',     pabrikNama: 'P3', subArea: 'Ammonia',    equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 6,  dateSecond: 16 },
  { code: 'P3-ROT-NC-UREA',        pabrikNama: 'P3', subArea: 'Urea',       equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 6,  dateSecond: 16 },
  { code: 'P3-ROT-NC-UTILITY',     pabrikNama: 'P3', subArea: 'Utility',    equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 6,  dateSecond: 16 },
  { code: 'P3-GTG',                pabrikNama: 'P3', subArea: 'GTG P3',     equipmentCat: 'GTG',      criticality: 'CRITICAL',     taskName: 'Pengukuran PdM Critical',     recurrence: 'MONTHLY_ONCE',  dateFirst: 9,  dateSecond: null },
  { code: 'P3-ROT-CRIT',           pabrikNama: 'P3', subArea: 'Compressor', equipmentCat: 'ROTATING', criticality: 'CRITICAL',     taskName: 'Pengukuran PdM Critical',     recurrence: 'MONTHLY_ONCE',  dateFirst: 9,  dateSecond: null },

  // Pabrik 4 – Rotating
  { code: 'P4-ROT-NC-AMMONIA',     pabrikNama: 'P4', subArea: 'Ammonia',    equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 8,  dateSecond: 22 },
  { code: 'P4-ROT-NC-UREA',        pabrikNama: 'P4', subArea: 'Urea',       equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 8,  dateSecond: 22 },
  { code: 'P4-ROT-NC-UTILITY',     pabrikNama: 'P4', subArea: 'Utility',    equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 8,  dateSecond: 22 },
  { code: 'P4-GTG',                pabrikNama: 'P4', subArea: 'GTG P4',     equipmentCat: 'GTG',      criticality: 'CRITICAL',     taskName: 'Pengukuran PdM Critical',     recurrence: 'MONTHLY_ONCE',  dateFirst: 11, dateSecond: null },
  { code: 'P4-ROT-CRIT',           pabrikNama: 'P4', subArea: 'Compressor', equipmentCat: 'ROTATING', criticality: 'CRITICAL',     taskName: 'Pengukuran PdM Critical',     recurrence: 'MONTHLY_ONCE',  dateFirst: 11, dateSecond: null },

  // Pabrik 5 – Rotating
  { code: 'P5-ROT-NC-AMMONIA',     pabrikNama: 'P5', subArea: 'Ammonia',    equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 11, dateSecond: 23 },
  { code: 'P5-ROT-NC-UREA',        pabrikNama: 'P5', subArea: 'Urea',       equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 11, dateSecond: 23 },
  { code: 'P5-ROT-NC-UTILITY',     pabrikNama: 'P5', subArea: 'Utility',    equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 11, dateSecond: 23 },
  { code: 'P5-STG',                pabrikNama: 'P5', subArea: 'STG 1-2',    equipmentCat: 'STG',      criticality: 'CRITICAL',     taskName: 'Pengukuran PdM Critical',     recurrence: 'MONTHLY_ONCE',  dateFirst: 16, dateSecond: null },
  { code: 'P5-ROT-CRIT',           pabrikNama: 'P5', subArea: 'Compressor', equipmentCat: 'ROTATING', criticality: 'CRITICAL',     taskName: 'Pengukuran PdM Critical',     recurrence: 'MONTHLY_ONCE',  dateFirst: 16, dateSecond: null },

  // Pabrik 6 – Rotating
  { code: 'P6-ROT-NC-UTIL-UREA',    pabrikNama: 'P6', subArea: 'Utility & Urea',             equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 6,    dateSecond: 16 },
  { code: 'P6-ROT-NC-BB',           pabrikNama: 'P6', subArea: 'BB',                         equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 8,    dateSecond: 18 },
  { code: 'P6-PPHS-ROT-NC-CONVEYOR',pabrikNama: 'P6', subArea: 'PPHS & OSBL – Conveyor',    equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 11,   dateSecond: 24 },
  { code: 'P6-PPHS-ROT-NC-ASUASP',  pabrikNama: 'P6', subArea: 'PPHS & OSBL – ASU-ASP',    equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 12,   dateSecond: 25 },
  { code: 'P6-PPHS-STA-CRIT',       pabrikNama: 'P6', subArea: 'PPHS & OSBL – Check Visual',equipmentCat: 'STATIC',   criticality: 'CRITICAL',     taskName: 'Check Visual PdM Critical',   recurrence: 'TENTATIVE',     dateFirst: null, dateSecond: null },

  // Pabrik 7 – Rotating
  { code: 'P7-ROT-NC-FUSION1',     pabrikNama: 'P7', subArea: 'Fusion 1', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 8, dateSecond: 20 },
  { code: 'P7-ROT-NC-FUSION2',     pabrikNama: 'P7', subArea: 'Fusion 2', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL', taskName: 'Pengukuran PdM Non Critical', recurrence: 'MONTHLY_TWICE', dateFirst: 8, dateSecond: 20 },
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
