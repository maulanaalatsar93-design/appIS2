import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('Seeding Users from ManPower...');
  try {
    const manPowers = await prisma.manPower.findMany();
    const defaultPassword = await bcrypt.hash('password123', 10);

    let created = 0;
    let updated = 0;

    for (const mp of manPowers) {
      const npk = mp.npk;
      const pos = (mp.position || '').toUpperCase();
      
      let role = 'staff';
      if (pos.includes('SVP') || pos.includes(' VP')) role = 'vp';
      else if (pos.includes('AVP')) role = 'avp';
      else if (pos.includes('MANAGER')) role = 'manager';
      else if (pos.includes('SUPERVISOR') || pos.includes('SPV') || pos.includes('SUPERINTENDENT')) role = 'supervisor';
      else if (pos.includes('ADMIN')) role = 'admin';

      // Override for Maulana Cipta P
      if (mp.name.toLowerCase().includes('maulana cipta p')) {
        role = 'admin';
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { npk },
            { man_power_id: mp.id }
          ]
        }
      });

      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role,
            man_power_id: mp.id,
            name: mp.name, // optional update name
            npk
          }
        });
        updated++;
      } else {
        await prisma.user.create({
          data: {
            npk,
            password: defaultPassword,
            name: mp.name,
            role,
            man_power_id: mp.id
          }
        });
        created++;
      }
    }

    console.log(`Seeding complete. Created ${created} new users, updated ${updated} existing users.`);
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
