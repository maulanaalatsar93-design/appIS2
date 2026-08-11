import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { endOfMonth, startOfMonth, getDaysInMonth, addDays, getDay, isSameDay } from 'date-fns';

// --- Helper Functions ---

// Fetch holidays for shifting dates
const getHolidaysInMonth = async (year, month) => {
  // We assume HariLibur stores dates in "tanggal" field
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // last day
  
  const holidays = await prisma.hariLibur.findMany({
    where: {
      tanggal: {
        gte: start,
        lte: end
      }
    }
  });
  return holidays.map(h => new Date(h.tanggal).toISOString().split('T')[0]);
};

// Check if a date is weekend or holiday
const isWeekendOrHoliday = (dateObj, holidayStrArray) => {
  const day = getDay(dateObj); // 0 = Sunday, 6 = Saturday
  if (day === 0 || day === 6) return true;
  
  const dateStr = dateObj.toISOString().split('T')[0];
  return holidayStrArray.includes(dateStr);
};

// Shift date to next working day
const getEffectiveDate = (scheduledDate, holidayStrArray) => {
  let current = new Date(scheduledDate);
  while (isWeekendOrHoliday(current, holidayStrArray)) {
    current = addDays(current, 1);
  }
  return current;
};

// --- Controllers ---

export const getRules = async (req, res) => {
  try {
    const rules = await prisma.pdmScheduleRule.findMany({
      include: {
        pabrik: true,
        defaultPic: true
      },
      orderBy: { id: 'desc' }
    });
    res.json(rules);
  } catch (error) {
    console.error('Error getRules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRule = async (req, res) => {
  try {
    const { code, pabrik_id, subArea, equipmentCat, criticality, taskName, recurrence, dateFirst, dateSecond, defaultPicId, notes } = req.body;
    const rule = await prisma.pdmScheduleRule.create({
      data: {
        code,
        pabrik_id: parseInt(pabrik_id),
        subArea,
        equipmentCat,
        criticality,
        taskName,
        recurrence,
        dateFirst: dateFirst ? parseInt(dateFirst) : null,
        dateSecond: dateSecond ? parseInt(dateSecond) : null,
        defaultPicId: defaultPicId ? parseInt(defaultPicId) : null,
        notes
      }
    });
    res.status(201).json(rule);
  } catch (error) {
    console.error('Error createRule:', error);
    if (error.code === 'P2002') return res.status(400).json({ error: 'Code rule sudah ada.' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, pabrik_id, subArea, equipmentCat, criticality, taskName, recurrence, dateFirst, dateSecond, defaultPicId, notes, isActive } = req.body;
    const rule = await prisma.pdmScheduleRule.update({
      where: { id: parseInt(id) },
      data: {
        code,
        pabrik_id: pabrik_id ? parseInt(pabrik_id) : undefined,
        subArea,
        equipmentCat,
        criticality,
        taskName,
        recurrence,
        dateFirst: dateFirst ? parseInt(dateFirst) : null,
        dateSecond: dateSecond ? parseInt(dateSecond) : null,
        defaultPicId: defaultPicId ? parseInt(defaultPicId) : null,
        notes,
        isActive
      }
    });
    res.json(rule);
  } catch (error) {
    console.error('Error updateRule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pdmScheduleRule.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleteRule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateMonthlySchedule = async (req, res) => {
  try {
    const { year, month } = req.body; // e.g. 2024, 8
    if (!year || !month) return res.status(400).json({ error: 'Year dan Month harus diisi' });

    // 1. Ambil rules aktif untuk kategori yg butuh generate otomatis
    const rules = await prisma.pdmScheduleRule.findMany({
      where: {
        isActive: true,
        recurrence: { in: ['MONTHLY_ONCE', 'MONTHLY_TWICE'] }
      },
      include: {
        monthlyPicOverrides: {
          where: { year: parseInt(year), month: parseInt(month) }
        }
      }
    });

    const holidays = await getHolidaysInMonth(parseInt(year), parseInt(month));
    const daysInMonth = getDaysInMonth(new Date(parseInt(year), parseInt(month) - 1, 1));

    let createdCount = 0;

    for (const rule of rules) {
      const datesToGenerate = [];
      if (rule.recurrence === 'MONTHLY_ONCE' && rule.dateFirst) {
        datesToGenerate.push(Math.min(rule.dateFirst, daysInMonth));
      } else if (rule.recurrence === 'MONTHLY_TWICE' && rule.dateFirst && rule.dateSecond) {
        datesToGenerate.push(Math.min(rule.dateFirst, daysInMonth));
        datesToGenerate.push(Math.min(rule.dateSecond, daysInMonth));
      }

      for (const day of datesToGenerate) {
        const scheduledDate = new Date(year, month - 1, day, 8, 0, 0); // Jam 8 pagi
        
        // Cek duplicate
        const existing = await prisma.pdmScheduleOccurrence.findUnique({
          where: {
            ruleId_scheduledDate: {
              ruleId: rule.id,
              scheduledDate: scheduledDate
            }
          }
        });
        
        if (!existing) {
          const effectiveDate = getEffectiveDate(scheduledDate, holidays);
          const wasShifted = !isSameDay(scheduledDate, effectiveDate);
          
          let assignedToId = null;
          if (rule.monthlyPicOverrides.length > 0) {
            assignedToId = rule.monthlyPicOverrides[0].picId;
          } else if (rule.defaultPicId) {
            assignedToId = rule.defaultPicId;
          }

          const status = assignedToId ? 'ASSIGNED' : 'SCHEDULED';

          await prisma.pdmScheduleOccurrence.create({
            data: {
              ruleId: rule.id,
              scheduledDate,
              effectiveDate,
              wasShifted,
              status,
              assignedToId,
              originalPicId: assignedToId
            }
          });
          createdCount++;
        }
      }
    }

    res.json({ message: `Generate berhasil. ${createdCount} task baru dibuat.` });
  } catch (error) {
    console.error('Error generateMonthlySchedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOccurrences = async (req, res) => {
  try {
    const { year, month, status, pabrik_id } = req.query;
    
    let dateFilter = {};
    if (year && month) {
      const y = parseInt(year);
      const m = parseInt(month);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59);
      dateFilter = {
        scheduledDate: { gte: start, lte: end }
      };
    }

    let ruleFilter = {};
    if (pabrik_id) {
      ruleFilter.pabrik_id = parseInt(pabrik_id);
    }

    const occurrences = await prisma.pdmScheduleOccurrence.findMany({
      where: {
        ...dateFilter,
        status: status ? status : undefined,
        rule: ruleFilter
      },
      include: {
        rule: {
          include: { pabrik: true }
        },
        assignedTo: true
      },
      orderBy: { scheduledDate: 'asc' }
    });

    res.json(occurrences);
  } catch (error) {
    console.error('Error getOccurrences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id; // assume authMiddleware sets req.user
    
    const manpower = await prisma.manPower.findFirst({
      where: { user_id: userId }
    });

    if (!manpower) return res.status(404).json({ error: 'Manpower tidak ditemukan untuk user ini' });

    const tasks = await prisma.pdmScheduleOccurrence.findMany({
      where: {
        assignedToId: manpower.id,
        status: {
          in: ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD']
        }
      },
      include: {
        rule: {
          include: { pabrik: true }
        }
      },
      orderBy: { effectiveDate: 'asc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error getMyTasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const claimTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const manpower = await prisma.manPower.findFirst({ where: { user_id: userId } });
    if (!manpower) return res.status(404).json({ error: 'Manpower not found' });

    const occurrence = await prisma.pdmScheduleOccurrence.update({
      where: { id: parseInt(id) },
      data: {
        assignedToId: manpower.id,
        claimedAt: new Date(),
        status: 'ASSIGNED'
      }
    });
    res.json(occurrence);
  } catch (error) {
    console.error('Error claimTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const startTask = async (req, res) => {
  try {
    const { id } = req.params;
    const occurrence = await prisma.pdmScheduleOccurrence.update({
      where: { id: parseInt(id) },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });

    // Record activity
    await prisma.pdmDailyActivity.create({
      data: {
        occurrenceId: occurrence.id,
        workDate: new Date(),
        startTime: new Date(),
        statusSnapshot: 'IN_PROGRESS',
        activityNote: 'Task started'
      }
    });

    res.json(occurrence);
  } catch (error) {
    console.error('Error startTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const holdTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const occurrence = await prisma.pdmScheduleOccurrence.update({
      where: { id: parseInt(id) },
      data: {
        status: 'ON_HOLD'
      }
    });

    await prisma.pdmDailyActivity.create({
      data: {
        occurrenceId: occurrence.id,
        workDate: new Date(),
        startTime: new Date(), // This might be better as the actual time
        endTime: new Date(),
        statusSnapshot: 'ON_HOLD',
        activityNote: note || 'Task on hold'
      }
    });

    res.json(occurrence);
  } catch (error) {
    console.error('Error holdTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const occurrence = await prisma.pdmScheduleOccurrence.update({
      where: { id: parseInt(id) },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    await prisma.pdmDailyActivity.create({
      data: {
        occurrenceId: occurrence.id,
        workDate: new Date(),
        startTime: new Date(), 
        endTime: new Date(),
        statusSnapshot: 'COMPLETED',
        activityNote: note || 'Task completed'
      }
    });

    res.json(occurrence);
  } catch (error) {
    console.error('Error completeTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reassignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPicId, reason } = req.body;
    const adminUserId = req.user.id;

    // We can fetch admin's manpower ID or just store user id
    const admin = await prisma.manPower.findFirst({ where: { user_id: adminUserId } });

    const occurrence = await prisma.pdmScheduleOccurrence.update({
      where: { id: parseInt(id) },
      data: {
        assignedToId: parseInt(newPicId),
        reassignReason: reason,
        reassignedAt: new Date(),
        reassignedById: admin ? admin.id : null
      }
    });
    res.json(occurrence);
  } catch (error) {
    console.error('Error reassignTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
