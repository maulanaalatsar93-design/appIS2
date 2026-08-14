import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const data = [
  {
    item: 'Three way valve 309-J/JA',
    area_plant: 'Urea P2',
    masalah: 'Program penggantian dan perbaikan',
    tindak_lanjut: 'Fabrikasi seat di JPP dengan upgrade material dari PTFE Carbon menjadi Peek'
  },
  {
    item: 'MOV-10',
    area_plant: 'Amonia P2',
    masalah: 'Pada saat normal operasi MOV-10 amonia P2 terjadi case malfunction (open dengan sendirinya) untuk normalnya MOV-10 posisi full close',
    tindak_lanjut: 'Pemeriksaan pada motor actuator termasuk instrumentasi - fabrikasi clamp penahan stem untuk mencegah stem open'
  },
  {
    item: '2 HV 2022',
    area_plant: 'Urea P4',
    masalah: 'Pada saat normal ops LV leakout sehingga menyebabkan urea P4 shut down',
    tindak_lanjut: 'Pembelian LV Baru'
  },
  {
    item: 'TS-0431',
    area_plant: 'Pabrik-1A',
    masalah: 'Nozzle stg#1 dan #3 erosi, dapat menyebabkan performance menurun',
    tindak_lanjut: 'Programkan penggantian Nozzle stg#1 dan #3 saat SDI/TA'
  },
  {
    item: 'P2-K-102',
    area_plant: 'Pabrik-1A',
    masalah: 'Vibrasi tinggi pada LPC (73 micron) dan Gearbox (48 micron)',
    tindak_lanjut: 'Programkan OH LPC & Gearbox saat ada kesempatan SDI/TA'
  },
  {
    item: '1TS-431',
    area_plant: 'Pabrik-4',
    masalah: 'Vibrasi tinggi pada turbine pada range 38 - 43 micron',
    tindak_lanjut: 'Percepatan repair rotor spare'
  },
  {
    item: 'P2-K-601',
    area_plant: 'Pabrik-1A',
    masalah: 'Temperature bearing fan relatif tinggi 82 - 90 degC',
    tindak_lanjut: 'Lakukan resetting centering motor / ganti motor sesuai spesifikasi original P-1A'
  },
  {
    item: '22-K-101 B',
    area_plant: 'Pabrik-6',
    masalah: 'Temperatur pressure discharge MP comp. masih tinggi 136 deg.C pada loadan 140 deg.C pada load 100% trend mendekati alarm temperature. (Alarm temperature MP comp. 150 deg.C )',
    tindak_lanjut: 'Runningkan compressor dengan load 75% dan monitor temp. sesuai periodic logsheet.\nSiapkan spare part internal valve dan lainnya.\nProgramkan pemeriksaan kondisi internal MP secara kesecara keseluruhan.\nNotif rekomendasi 22K-101 B\nM4 : 140000091539\nM7 : 170000011873'
  },
  {
    item: 'DBOOM-QAL D21-L-201-P6',
    area_plant: 'Pabrik-6',
    masalah: 'Berdasarkan surat dari VP Keandalan no. 24684/D/TK/D24600/IT/2026 perihal hasil assesment FTMD ITB mengenai umur pakai Boom diperkirakan hanya tersisa 4-5 tahun',
    tindak_lanjut: 'Perlu diprogramkan pemeriksaan dan perbaikan jangka pendek untuk mengetahui tingkat korosi pada struktural dengan kondisi QAL tidak beroperasi dan di sandarkan.\nNotif rekomendasi DBOOM-QAL-P6 (sudah kofirmasi ke renhar dan operasi)\nM4 : 140000092235'
  }
];

async function main() {
  console.log('Start seeding Performance Killer...');
  
  // Clear existing data (optional, maybe keep it?)
  await prisma.performanceKiller.deleteMany({});
  console.log('Cleared existing data.');

  for (const item of data) {
    await prisma.performanceKiller.create({
      data: item
    });
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
