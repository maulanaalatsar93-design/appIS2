import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.pdmScheduleRule.findMany({where:{pabrik_id:6}, select:{subArea:true}}).then(r => console.log([...new Set(r.map(x=>x.subArea))])).finally(()=>prisma.$disconnect());
