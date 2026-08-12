import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Users
  const users = [
    { email: 'admin@istek2.com', name: 'Administrator', password: passwordHash, role: 'admin' },
    { email: 'vp@istek2.com', name: 'Vice President', password: passwordHash, role: 'vp' },
    { email: 'avp@istek2.com', name: 'Assistant Vice President', password: passwordHash, role: 'avp' },
    { email: 'staff@istek2.com', name: 'Staff Inspection', password: passwordHash, role: 'staff' },
  ];

  console.log('Seeding Users...');
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  // 2. Seed Pabrik
  const pabriks = [
    { id: 1, nama_pabrik: 'P1A', kode_pabrik: 'P1A' },
    { id: 2, nama_pabrik: 'P2', kode_pabrik: 'P2' },
    { id: 3, nama_pabrik: 'P3', kode_pabrik: 'P3' },
    { id: 4, nama_pabrik: 'P4', kode_pabrik: 'P4' },
    { id: 5, nama_pabrik: 'P5', kode_pabrik: 'P5' },
    { id: 6, nama_pabrik: 'P6', kode_pabrik: 'P6' },
    { id: 7, nama_pabrik: 'P7', kode_pabrik: 'P7' },
    { id: 8, nama_pabrik: 'PPHS & OSBL', kode_pabrik: 'PPHS' },
  ];

  console.log('Seeding Pabrik...');
  for (const p of pabriks) {
    await prisma.pabrik.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // 3. Seed Divisi
  const divisis = [
    { id: 1, nama_divisi: 'Rotating 1', work_center_sap: 'D0179' },
    { id: 2, nama_divisi: 'Rotating 2', work_center_sap: 'D0180' },
    { id: 3, nama_divisi: 'PPHS & OSBL', work_center_sap: 'D0225' },
    { id: 4, nama_divisi: 'Bengkel', work_center_sap: 'D0169' },
    { id: 5, nama_divisi: 'Metalurgi', work_center_sap: 'D0171' },
    { id: 6, nama_divisi: 'QC', work_center_sap: 'D0170' },
    { id: 7, nama_divisi: 'Sekretaris', work_center_sap: null },
  ];

  console.log('Seeding Divisi...');
  for (const d of divisis) {
    await prisma.divisi.upsert({
      where: { id: d.id },
      update: {},
      create: d,
    });
  }

  // 4. Seed ManPower (41 Personil)
  const manPowers = [
    { npk: '4033496', name: 'Febryan Bagus P', employee_type: 'Organik', division_id: 1, position: 'Vice President', is_active: true },
    { npk: '4114064', name: 'Heri Kurniawan', employee_type: 'Organik', division_id: 1, position: 'AVP Rotating 1', is_active: true },
    { npk: '4093894', name: 'Rostam', employee_type: 'Organik', division_id: 3, position: 'AVP PPHS & OSBL', is_active: true },
    { npk: '4254883', name: 'Amir Salim', employee_type: 'Organik', division_id: 1, position: 'Rotating 1', is_active: true },
    { npk: '4244822', name: 'Teguh Pambudi', employee_type: 'Organik', division_id: 1, position: 'Rotating 1', is_active: true },
    { npk: '4244786', name: 'Farhan Alrosad Munir', employee_type: 'Organik', division_id: 1, position: 'Rotating 1', is_active: true },
    { npk: '4093895', name: 'Supriadi', employee_type: 'Organik', division_id: 2, position: 'AVP Rotating 2', is_active: true },
    { npk: '4124201', name: 'Grymen Paembonan', employee_type: 'Organik', division_id: 2, position: 'Rotating 2', is_active: true },
    { npk: '4164506', name: 'Aang Wisnugraha', employee_type: 'Organik', division_id: 2, position: 'Rotating 2', is_active: true },
    { npk: '4244820', name: 'Shofwan Jaharulfalah', employee_type: 'Organik', division_id: 2, position: 'Rotating 2', is_active: true },
    { npk: '4254882', name: 'Alvarizqi Abdullah', employee_type: 'Organik', division_id: 2, position: 'Rotating 2', is_active: true },
    { npk: '4254891', name: 'Krispinus', employee_type: 'Organik', division_id: 2, position: 'Rotating 2', is_active: true },
    { npk: 'K225716', name: 'Padil Sulhat', employee_type: 'Non Organik', division_id: 1, position: 'Rotating 1', is_active: true },
    { npk: 'K257607', name: 'Taufik Hidayat', employee_type: 'Non Organik', division_id: 1, position: 'Rotating 1', is_active: true },
    { npk: 'K257610', name: 'Syaharuddin', employee_type: 'Non Organik', division_id: 1, position: 'Rotating 1', is_active: true },
    { npk: 'K257616', name: 'Abdul Ghofur', employee_type: 'Non Organik', division_id: 1, position: 'Rotating 1', is_active: true },
    { npk: 'K257612', name: 'Yoga Pratama', employee_type: 'Non Organik', division_id: 2, position: 'Rotating 2', is_active: true },
    { npk: 'K257615', name: 'Novri Andri', employee_type: 'Non Organik', division_id: 2, position: 'Rotating 2', is_active: true },
    { npk: 'K257611', name: 'Muhammad Ardian', employee_type: 'Non Organik', division_id: 2, position: 'Rotating 2', is_active: true },
    { npk: 'K227517', name: 'Dicky Bastian', employee_type: 'Non Organik', division_id: 2, position: 'Rotating 2', is_active: true },
    { npk: 'K257608', name: 'Ibnu Kustriadi', employee_type: 'Non Organik', division_id: 2, position: 'Rotating 2', is_active: true },
    { npk: 'K12162', name: 'Faisal Dani P.', employee_type: 'Non Organik', division_id: 3, position: 'PPHS & OSBL', is_active: true },
    { npk: 'K225718', name: 'Maulana Cipta P', employee_type: 'Non Organik', division_id: 2, position: 'Rotating 2', is_active: true },
    { npk: '4093896', name: 'Zulkifli', employee_type: 'Organik', division_id: 4, position: 'AVP Bengkel', is_active: true },
    { npk: '4114066', name: 'Darmawan', employee_type: 'Organik', division_id: 4, position: 'Bengkel', is_active: true },
    { npk: '4244811', name: 'Muhammad Ilham N.', employee_type: 'Organik', division_id: 4, position: 'Bengkel', is_active: true },
    { npk: 'K257613', name: 'Windy Ferdiansyah', employee_type: 'Non Organik', division_id: 4, position: 'Bengkel', is_active: true },
    { npk: 'K257614', name: 'Fauzan Al Hafiz', employee_type: 'Non Organik', division_id: 4, position: 'Bengkel', is_active: true },
    { npk: 'K257617', name: 'Azhary Meril', employee_type: 'Non Organik', division_id: 4, position: 'Bengkel', is_active: true },
    { npk: 'K257618', name: 'Maulana Wafdullah', employee_type: 'Non Organik', division_id: 4, position: 'Bengkel', is_active: true },
    { npk: 'K257609', name: 'Arricson Marudut Nainggolan', employee_type: 'Non Organik', division_id: 4, position: 'Bengkel', is_active: true },
    { npk: '4144334', name: 'Ridwan Sunarya', employee_type: 'Organik', division_id: 5, position: 'AVP Metalurgi', is_active: true },
    { npk: '4234743', name: 'Fajar Adi Prasetya', employee_type: 'Organik', division_id: 5, position: 'Metalurgi', is_active: true },
    { npk: '4244788', name: 'Fitian Syauqi Firdaus F.', employee_type: 'Organik', division_id: 5, position: 'Metalurgi', is_active: true },
    { npk: '4124213', name: 'D.G. Pasarella', employee_type: 'Organik', division_id: 6, position: 'QC', is_active: true },
    { npk: 'KNE-B-25.1859', name: 'Nurdiansyah', employee_type: 'Non Organik', division_id: 5, position: 'Metalurgi', is_active: true },
    { npk: 'KNE-B-23.1258', name: 'Muhammad D.M.', employee_type: 'Non Organik', division_id: 5, position: 'Metalurgi', is_active: true },
    { npk: 'KNE-B-22.684', name: 'Joko Purnomo', employee_type: 'Non Organik', division_id: 6, position: 'QC', is_active: true },
    { npk: 'KNE-B-25.1928', name: 'Dani Yuwana', employee_type: 'Non Organik', division_id: 5, position: 'Metalurgi', is_active: true },
    { npk: 'KNE-B-25.1974', name: 'Tabah Triananto', employee_type: 'Non Organik', division_id: 5, position: 'Metalurgi', is_active: true },
    { npk: 'K268492', name: 'Anggit Dwi Yanti', employee_type: 'Non Organik', division_id: 7, position: 'Sekretaris', is_active: true },
  ];

  console.log('Seeding ManPower...');
  for (const m of manPowers) {
    await prisma.manPower.upsert({
      where: { npk: m.npk },
      update: {},
      create: m,
    });
  }

  // 5. Seed Status Kehadiran (Mock Absensi)
  // Get ManPower IDs
  const amir = await prisma.manPower.findUnique({ where: { npk: '4254883' } });
  const aang = await prisma.manPower.findUnique({ where: { npk: '4164506' } });

  console.log('Seeding Status Kehadiran (Mock Absensi)...');
  const absensiList = [];
  if (amir) {
    absensiList.push({
      man_power_id: amir.id,
      jenis: 'Cuti', // id: 3 in frontend
      start_date: new Date(new Date().setHours(0,0,0,0)), // Today
      end_date: new Date(new Date().setDate(new Date().getDate() + 2)), // +2 days
      keterangan: 'Cuti Tahunan',
    });
  }
  if (aang) {
    absensiList.push({
      man_power_id: aang.id,
      jenis: 'Dinas Dalam Negeri', // id: 5 in frontend
      start_date: new Date(new Date().setHours(0,0,0,0)), // Today
      end_date: new Date(new Date().setDate(new Date().getDate() + 3)), // +3 days
      keterangan: 'Inspeksi Kilang P7',
    });
  }

  for (const abs of absensiList) {
    // Basic upsert based on manpower and date
    const existing = await prisma.statusKehadiran.findFirst({
      where: {
        man_power_id: abs.man_power_id,
        jenis: abs.jenis,
      }
    });
    if (!existing) {
      await prisma.statusKehadiran.create({
        data: abs
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
