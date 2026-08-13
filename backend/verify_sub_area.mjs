import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const result = await p.manPower.findMany({
  select: { npk: true, name: true, sub_area: true, division_id: true },
  orderBy: { division_id: 'asc' }
});
console.log(JSON.stringify(result, null, 2));
await p.$disconnect();
