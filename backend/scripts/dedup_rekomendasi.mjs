import prisma from '../src/utils/prisma.js';

try {
  const result = await prisma.$executeRawUnsafe(`
    DELETE FROM public."Rekomendasi"
    WHERE id NOT IN (
      SELECT MIN(id) FROM public."Rekomendasi"
      GROUP BY notification, COALESCE(reported_by, '-')
    )
  `);
  console.log('Duplicates removed. Rows affected:', result);
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await prisma.$disconnect();
  process.exit(0);
}
