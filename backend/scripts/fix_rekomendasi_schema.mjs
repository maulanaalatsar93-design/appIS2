import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSchema() {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Rekomendasi" ADD COLUMN IF NOT EXISTS work_center TEXT'
    );
    console.log('[OK] Column work_center added to Rekomendasi table (or already exists)');
  } catch (err) {
    console.error('[ERR] Failed to add column:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSchema();
