import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testJobBoard() {
  const req = { user: { man_power_id: 9, role: 'staff' } }; // Aang Wisnugraha

  try {
    let userSubArea = null;
    let isAdmin = false;
    let isSpecialRole = false;

    if (req.user) {
      if (req.user.role === 'admin' || req.user.role === 'manager') isAdmin = true;
      isSpecialRole = isAdmin || ['analyst', 'avp'].includes((req.user.role || '').toLowerCase());
      if (req.user.man_power_id) {
        const mp = await prisma.manPower.findUnique({
          where: { id: parseInt(req.user.man_power_id) },
          select: { sub_area: true }
        });
        userSubArea = mp?.sub_area || null;
      }
    }

    console.log("userSubArea:", userSubArea);
    console.log("isSpecialRole:", isSpecialRole);

    let areaFilter = {};
    if (userSubArea && !isSpecialRole) {
      const match = userSubArea.match(/^(?:Pabrik\s+|P)(\d[A-Z]?)\s+(.+)$/i);
      if (match) {
        const pabrikCode = match[1];
        areaFilter = { 
          rule: { 
            pabrik: { nama_pabrik: { contains: pabrikCode, mode: 'insensitive' } },
            subArea: { contains: match[2].trim(), mode: 'insensitive' } 
          } 
        };
      } else {
        areaFilter = { rule: { subArea: { contains: userSubArea, mode: 'insensitive' } } };
      }
    }

    const where = {
      status: 'SCHEDULED',
      year: 2026,
      month: 8,
      ...areaFilter
    };

    const occurrences = await prisma.pdmScheduleOccurrence.findMany({
      where,
      include: {
        rule: { include: { pabrik: true } },
        dataCollector: { select: { id: true, name: true, npk: true } },
        analyst: { select: { id: true, name: true, npk: true } },
      },
      orderBy: { scheduledDate: 'asc' }
    });
    console.log("Occurrences found:", occurrences.length);
  } catch (err) {
    console.error(err);
  }
}

testJobBoard().finally(() => prisma.$disconnect());
