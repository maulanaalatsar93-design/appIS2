import prisma from '../utils/prisma.js';

const MASTER_RULES = [
  // ============================================
  // Pabrik 6 — PPHS & OSBL
  // ============================================
  // Dynamic / Rotating PdM
  { code: 'P6-ASUASP-ALL', pabrikNama: 'P6', subArea: 'ASU/ASP', taskName: 'Pengukuran All Item', dateFirst: 12, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-ASUASP-MED', pabrikNama: 'P6', subArea: 'ASU/ASP', taskName: 'Pengukuran Medium Item', dateFirst: 25, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-CONV-PROD', pabrikNama: 'P6', subArea: 'Conveyor PRODUCT', taskName: 'Pengukuran', dateFirst: 11, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-CONV-STOR', pabrikNama: 'P6', subArea: 'Conveyor STORAGE', taskName: 'Pengukuran', dateFirst: 11, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-CONV-SHIP', pabrikNama: 'P6', subArea: 'Conveyor SHIPPING', taskName: 'Pengukuran', dateFirst: 11, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-CONV-UBS', pabrikNama: 'P6', subArea: 'Conveyor UBS', taskName: 'Pengukuran', dateFirst: 11, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-CONV-MED', pabrikNama: 'P6', subArea: 'Conveyor', taskName: 'Pengukuran Medium Item', dateFirst: 24, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  // Static PdM
  { code: 'P6-TANK-METH', pabrikNama: 'P6', subArea: 'Tanki Methanol', taskName: 'Static PdM', dateFirst: null, recurrence: 'TENTATIVE', equipmentCat: 'STATIC', criticality: 'NON_CRITICAL' },
  { code: 'P6-UBS3-STAT', pabrikNama: 'P6', subArea: 'UBS 3', taskName: 'Static PdM', dateFirst: null, recurrence: 'TENTATIVE', equipmentCat: 'STATIC', criticality: 'NON_CRITICAL' },
  { code: 'P6-QAL-STAT', pabrikNama: 'P6', subArea: 'QAL', taskName: 'Static PdM', dateFirst: null, recurrence: 'TENTATIVE', equipmentCat: 'STATIC', criticality: 'NON_CRITICAL' },
  { code: 'P6-BSL2-STAT', pabrikNama: 'P6', subArea: 'BSL 2', taskName: 'Static PdM', dateFirst: null, recurrence: 'TENTATIVE', equipmentCat: 'STATIC', criticality: 'NON_CRITICAL' },
  { code: 'P6-UBS4-STAT', pabrikNama: 'P6', subArea: 'UBS 4', taskName: 'Static PdM', dateFirst: null, recurrence: 'TENTATIVE', equipmentCat: 'STATIC', criticality: 'NON_CRITICAL' },

  // ============================================
  // ROTATING-1
  // ============================================
  // Pabrik 6
  { code: 'P6-UTIL-ALL', pabrikNama: 'P6', subArea: 'Utility', taskName: 'Pengukuran All Item', dateFirst: 4, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-UTIL-MED', pabrikNama: 'P6', subArea: 'Utility', taskName: 'Pengukuran Medium Item', dateFirst: 16, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-UREA-ALL', pabrikNama: 'P6', subArea: 'Urea', taskName: 'Pengukuran All Item', dateFirst: 4, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-UREA-MED', pabrikNama: 'P6', subArea: 'Urea', taskName: 'Pengukuran Medium Item', dateFirst: 16, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-BB-ALL', pabrikNama: 'P6', subArea: 'BatuBara Boiler', taskName: 'Pengukuran All Item', dateFirst: 8, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-BB-MED', pabrikNama: 'P6', subArea: 'BatuBara Boiler', taskName: 'Pengukuran Medium Item', dateFirst: 18, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P6-STG1-CRIT', pabrikNama: 'P6', subArea: 'Critical STG 1', taskName: 'Critical', dateFirst: 7, recurrence: 'MONTHLY_ONCE', equipmentCat: 'STG', criticality: 'CRITICAL' },
  { code: 'P6-STG2-CRIT', pabrikNama: 'P6', subArea: 'Critical STG 2', taskName: 'Critical', dateFirst: 7, recurrence: 'MONTHLY_ONCE', equipmentCat: 'STG', criticality: 'CRITICAL' },

  // Pabrik 2
  { code: 'P2-UTIL-ALL', pabrikNama: 'P2', subArea: 'Utility', taskName: 'Pengukuran All Item', dateFirst: 4, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P2-UTIL-MED', pabrikNama: 'P2', subArea: 'Utility', taskName: 'Pengukuran Medium Item', dateFirst: 15, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P2-UREA-ALL', pabrikNama: 'P2', subArea: 'Urea', taskName: 'Pengukuran All Item', dateFirst: 4, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P2-UREA-MED', pabrikNama: 'P2', subArea: 'Urea', taskName: 'Pengukuran Medium Item', dateFirst: 15, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P2-AMM-ALL', pabrikNama: 'P2', subArea: 'Ammonia', taskName: 'Pengukuran All Item', dateFirst: 4, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P2-AMM-MED', pabrikNama: 'P2', subArea: 'Ammonia', taskName: 'Pengukuran Medium Item', dateFirst: 15, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P2-GTG-CRIT', pabrikNama: 'P2', subArea: 'Critical GTG', taskName: 'Critical', dateFirst: 6, recurrence: 'MONTHLY_ONCE', equipmentCat: 'GTG', criticality: 'CRITICAL' },
  { code: 'P2-COMP-CRIT', pabrikNama: 'P2', subArea: 'Critical Compressor', taskName: 'Critical', dateFirst: 5, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'CRITICAL' },
  { code: 'P2-REVAMP-CRIT', pabrikNama: 'P2', subArea: 'Critical 1106 Re-Vamp', taskName: 'Critical', dateFirst: 5, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'CRITICAL' },

  // Pabrik 5
  { code: 'P5-UTIL-ALL', pabrikNama: 'P5', subArea: 'Utility', taskName: 'Pengukuran All Item', dateFirst: 11, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P5-UTIL-MED', pabrikNama: 'P5', subArea: 'Utility', taskName: 'Pengukuran Medium Item', dateFirst: 23, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P5-UREA-ALL', pabrikNama: 'P5', subArea: 'Urea', taskName: 'Pengukuran All Item', dateFirst: 11, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P5-UREA-MED', pabrikNama: 'P5', subArea: 'Urea', taskName: 'Pengukuran Medium Item', dateFirst: 23, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P5-UREAG-ALL', pabrikNama: 'P5', subArea: 'Urea Granul', taskName: 'Pengukuran All Item', dateFirst: 11, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P5-UREAG-MED', pabrikNama: 'P5', subArea: 'Urea Granul', taskName: 'Pengukuran Medium Item', dateFirst: 23, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P5-AMM-ALL', pabrikNama: 'P5', subArea: 'Ammonia', taskName: 'Pengukuran All Item', dateFirst: 11, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P5-AMM-MED', pabrikNama: 'P5', subArea: 'Ammonia', taskName: 'Pengukuran Medium Item', dateFirst: 23, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P5-COMP-CRIT', pabrikNama: 'P5', subArea: 'Critical Compressor', taskName: 'Critical', dateFirst: 16, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'CRITICAL' },

  // ============================================
  // ROTATING-2
  // ============================================
  // Pabrik 1A
  { code: 'P1A-UTIL-ALL', pabrikNama: 'P1A', subArea: 'Utility', taskName: 'Pengukuran All Item', dateFirst: 1, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P1A-UTIL-MED', pabrikNama: 'P1A', subArea: 'Utility', taskName: 'Pengukuran Medium Item', dateFirst: 13, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P1A-UREA-ALL', pabrikNama: 'P1A', subArea: 'Urea', taskName: 'Pengukuran All Item', dateFirst: 1, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P1A-UREA-MED', pabrikNama: 'P1A', subArea: 'Urea', taskName: 'Pengukuran Medium Item', dateFirst: 13, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P1A-AMM-ALL', pabrikNama: 'P1A', subArea: 'Ammonia', taskName: 'Pengukuran All Item', dateFirst: 1, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P1A-AMM-MED', pabrikNama: 'P1A', subArea: 'Ammonia', taskName: 'Pengukuran Medium Item', dateFirst: 13, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P1A-COMP-CRIT', pabrikNama: 'P1A', subArea: 'Critical Compressor', taskName: 'Critical', dateFirst: 4, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'CRITICAL' },

  // Pabrik 3
  { code: 'P3-UTIL-ALL', pabrikNama: 'P3', subArea: 'Utility', taskName: 'Pengukuran All Item', dateFirst: 5, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P3-UTIL-MED', pabrikNama: 'P3', subArea: 'Utility', taskName: 'Pengukuran Medium Item', dateFirst: 16, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P3-UREA-ALL', pabrikNama: 'P3', subArea: 'Urea', taskName: 'Pengukuran All Item', dateFirst: 5, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P3-UREA-MED', pabrikNama: 'P3', subArea: 'Urea', taskName: 'Pengukuran Medium Item', dateFirst: 16, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P3-AMM-ALL', pabrikNama: 'P3', subArea: 'Ammonia', taskName: 'Pengukuran All Item', dateFirst: 5, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P3-AMM3-MED', pabrikNama: 'P3', subArea: 'Ammonia #3', taskName: 'Pengukuran Medium Item', dateFirst: 16, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P3-GTG-CRIT', pabrikNama: 'P3', subArea: 'Critical GTG', taskName: 'Critical', dateFirst: 9, recurrence: 'MONTHLY_ONCE', equipmentCat: 'GTG', criticality: 'CRITICAL' },
  { code: 'P3-COMP-CRIT', pabrikNama: 'P3', subArea: 'Critical Compressor', taskName: 'Critical', dateFirst: 8, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'CRITICAL' },

  // Pabrik 4
  { code: 'P4-UTIL-ALL', pabrikNama: 'P4', subArea: 'Utility', taskName: 'Pengukuran All Item', dateFirst: 8, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P4-UTIL-MED', pabrikNama: 'P4', subArea: 'Utility', taskName: 'Pengukuran Medium Item', dateFirst: 22, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P4-UREA-ALL', pabrikNama: 'P4', subArea: 'Urea', taskName: 'Pengukuran All Item', dateFirst: 8, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P4-UREA-MED', pabrikNama: 'P4', subArea: 'Urea', taskName: 'Pengukuran Medium Item', dateFirst: 22, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P4-AMM-ALL', pabrikNama: 'P4', subArea: 'Ammonia', taskName: 'Pengukuran All Item', dateFirst: 8, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P4-AMM-MED', pabrikNama: 'P4', subArea: 'Ammonia', taskName: 'Pengukuran Medium Item', dateFirst: 22, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P4-GTG-CRIT', pabrikNama: 'P4', subArea: 'Critical GTG', taskName: 'Critical', dateFirst: 11, recurrence: 'MONTHLY_ONCE', equipmentCat: 'GTG', criticality: 'CRITICAL' },
  { code: 'P4-COMP-CRIT', pabrikNama: 'P4', subArea: 'Critical Compressor', taskName: 'Critical', dateFirst: 12, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'CRITICAL' },

  // Pabrik 7
  { code: 'P7-FUS1-ALL', pabrikNama: 'P7', subArea: 'NPK Fusion 1', taskName: 'Pengukuran All Item', dateFirst: 9, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P7-FUS1-MED', pabrikNama: 'P7', subArea: 'NPK Fusion 1', taskName: 'Pengukuran Medium Item', dateFirst: 20, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P7-FUS2-ALL', pabrikNama: 'P7', subArea: 'NPK Fusion 2', taskName: 'Pengukuran All Item', dateFirst: 9, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
  { code: 'P7-FUS2-MED', pabrikNama: 'P7', subArea: 'NPK Fusion 2', taskName: 'Pengukuran Medium Item', dateFirst: 20, recurrence: 'MONTHLY_ONCE', equipmentCat: 'ROTATING', criticality: 'NON_CRITICAL' },
];

async function main() {
  console.log('🌱 Seeding NEW PdM master schedule rules...');
  
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
        dateSecond: null,
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
        dateSecond: null,
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
