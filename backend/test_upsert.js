const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const res = await prisma.$queryRawUnsafe(`
      INSERT INTO public."Rekomendasi" (notification, pabrik_id) VALUES ('TEST1', 1)
      ON CONFLICT (notification) DO UPDATE SET pabrik_id = 1
    `);
    console.log("SUCCESS");
  } catch (err) {
    console.log("ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
