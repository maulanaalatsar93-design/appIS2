import prisma from '../src/utils/prisma.js';

try {
  const res1 = await prisma.$queryRawUnsafe(`
    INSERT INTO public."Rekomendasi" (notification, reported_by, pabrik_id, "createdAt", "updatedAt")
    VALUES ('TEST-9999', 'TESTER', 1, NOW(), NOW())
    ON CONFLICT (notification, reported_by) DO UPDATE SET pabrik_id = EXCLUDED.pabrik_id
    RETURNING (xmax = 0) AS is_insert
  `);
  console.log('Test 1 (New Insert):', res1);

  const res2 = await prisma.$queryRawUnsafe(`
    INSERT INTO public."Rekomendasi" (notification, reported_by, pabrik_id, "createdAt", "updatedAt")
    VALUES ('TEST-9999', 'TESTER', 1, NOW(), NOW())
    ON CONFLICT (notification, reported_by) DO UPDATE SET pabrik_id = EXCLUDED.pabrik_id
    RETURNING (xmax = 0) AS is_insert
  `);
  console.log('Test 2 (Overwrite Update):', res2);

  await prisma.$executeRawUnsafe(`DELETE FROM public."Rekomendasi" WHERE notification = 'TEST-9999'`);
} catch (err) {
  console.error('Error:', err);
} finally {
  await prisma.$disconnect();
  process.exit(0);
}
