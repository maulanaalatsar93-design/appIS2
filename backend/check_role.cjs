const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);
  
  // Find Febryan
  const febryan = users.find(u => u.name.includes("Febryan"));
  if (febryan && febryan.role !== 'vp') {
    await prisma.user.update({
      where: { id: febryan.id },
      data: { role: 'vp' }
    });
    console.log("Updated Febryan's role to vp!");
  } else {
      console.log("Febryan role is already vp or user not found.");
  }
}
check().catch(console.error).finally(() => prisma.$disconnect());
