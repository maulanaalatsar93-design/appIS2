import prisma from '../utils/prisma.js';
import { getUserAreaContext, canReadOccurrence, canWriteOccurrence, hasCrossDelegation } from './pdmAccessControl.js';

// Helper: cek apakah tanggal adalah hari libur (Sabtu/Minggu atau tanggal merah)
async function isHoliday(date) {
  const day = date.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return true;

  // Cek di tabel HariLibur jika ada
  try {
    const dateStr = date.toISOString().split('T')[0];
    const holiday = await prisma.hariLibur.findFirst({
      where: { tanggal: { equals: new Date(dateStr) } }
    });
    return !!holiday;
  } catch {
    return false; // tabel tidak ada, hanya cek weekend
  }
}

// Helper: geser ke hari kerja berikutnya
async function shiftToWorkday(date) {
  let shifted = new Date(date);
  let wasShifted = false;
  while (await isHoliday(shifted)) {
    shifted.setDate(shifted.getDate() + 1);
    wasShifted = true;
  }
  return { effectiveDate: shifted, wasShifted };
}

// ============================================================
// CRUD MASTER RULE
// ============================================================

export const getRules = async (req, res) => {
  try {
    const { pabrik_id, equipmentCat, criticality, isActive } = req.query;
    const where = {};
    if (pabrik_id) where.pabrik_id = parseInt(pabrik_id);
    if (equipmentCat) where.equipmentCat = equipmentCat;
    if (criticality) where.criticality = criticality;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const rules = await prisma.pdmScheduleRule.findMany({
      where,
      include: {
        pabrik: true,
        defaultPic: { select: { id: true, name: true, npk: true, position: true } },
        _count: { select: { occurrences: true } }
      },
      orderBy: [{ pabrik_id: 'asc' }, { subArea: 'asc' }]
    });
    res.json(rules);
  } catch (err) {
    console.error('getRules error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createRule = async (req, res) => {
  try {
    const { code, pabrik_id, subArea, equipmentCat, criticality, taskName, recurrence, dateFirst, dateSecond, defaultPicId, notes, isActive } = req.body;
    if (!code || !pabrik_id || !equipmentCat || !criticality || !taskName || !recurrence) {
      return res.status(400).json({ error: 'Field wajib: code, pabrik_id, equipmentCat, criticality, taskName, recurrence' });
    }
    const rule = await prisma.pdmScheduleRule.create({
      data: {
        code, pabrik_id: parseInt(pabrik_id), subArea,
        equipmentCat, criticality, taskName, recurrence,
        dateFirst: dateFirst ? parseInt(dateFirst) : null,
        dateSecond: dateSecond ? parseInt(dateSecond) : null,
        defaultPicId: defaultPicId ? parseInt(defaultPicId) : null,
        notes, isActive: isActive !== false
      },
      include: { pabrik: true, defaultPic: { select: { id: true, name: true } } }
    });
    res.status(201).json(rule);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Kode rule sudah ada' });
    res.status(500).json({ error: err.message });
  }
};

export const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.pabrik_id) data.pabrik_id = parseInt(data.pabrik_id);
    if (data.dateFirst) data.dateFirst = parseInt(data.dateFirst);
    if (data.dateSecond !== undefined) data.dateSecond = data.dateSecond ? parseInt(data.dateSecond) : null;
    if (data.defaultPicId !== undefined) data.defaultPicId = data.defaultPicId ? parseInt(data.defaultPicId) : null;
    delete data.id;
    const rule = await prisma.pdmScheduleRule.update({ where: { id: parseInt(id) }, data, include: { pabrik: true, defaultPic: { select: { id: true, name: true } } } });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pdmScheduleRule.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Rule berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// GENERATE MONTHLY SCHEDULE
// ============================================================

export const generateMonthlySchedule = async (req, res) => {
  try {
    const { year, month, pabrik_id } = req.body;
    if (!year || !month) return res.status(400).json({ error: 'year dan month wajib diisi' });

    const y = parseInt(year);
    const m = parseInt(month);

    const where = { isActive: true, recurrence: { not: 'TENTATIVE' } };
    if (pabrik_id) where.pabrik_id = parseInt(pabrik_id);

    const rules = await prisma.pdmScheduleRule.findMany({
      where,
      include: {
        monthlyPicOverrides: { where: { year: y, month: m } },
        defaultPic: { select: { id: true, name: true } }
      }
    });

    let created = 0, skipped = 0;
    const results = [];

    for (const rule of rules) {
      const dates = [];
      if (rule.recurrence === 'MONTHLY_ONCE' && rule.dateFirst) {
        dates.push(rule.dateFirst);
      } else if (rule.recurrence === 'MONTHLY_TWICE') {
        if (rule.dateFirst) dates.push(rule.dateFirst);
        if (rule.dateSecond) dates.push(rule.dateSecond);
      }

      // Tentukan PIC bulan ini
      const override = rule.monthlyPicOverrides[0];
      const picId = override?.picId || rule.defaultPicId || null;
      const picName = rule.defaultPic?.name || null;

      for (const d of dates) {
        const targetDate = new Date(y, m - 1, d);
        const { effectiveDate, wasShifted } = await shiftToWorkday(new Date(targetDate));

        try {
          const occ = await prisma.pdmScheduleOccurrence.upsert({
            where: { ruleId_targetDate: { ruleId: rule.id, targetDate } },
            update: {}, // jangan override yang sudah ada
            create: {
              ruleId: rule.id,
              targetDate,
              scheduledDate: effectiveDate,
              wasShifted,
              year: y,
              month: m,
              status: picId ? 'ASSIGNED' : 'SCHEDULED',
              assignedToId: picId,
              originalPicId: picId,
              originalPicName: picName,
            }
          });
          created++;
          results.push({ code: rule.code, targetDate: targetDate.toISOString().split('T')[0], scheduledDate: effectiveDate.toISOString().split('T')[0], wasShifted });
        } catch (e) {
          if (e.code !== 'P2002') throw e;
          skipped++;
        }
      }
    }

    res.json({ message: `Generate selesai: ${created} occurrence dibuat, ${skipped} dilewati (sudah ada).`, results });
  } catch (err) {
    console.error('generateMonthlySchedule error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// QUERY OCCURRENCES
// ============================================================

export const getOccurrences = async (req, res) => {
  try {
    const { year, month, pabrik_id, subArea, status, criticality, equipmentCat, assignedToId } = req.query;

    const where = {};
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);
    if (status) {
      if (status.includes(',')) where.status = { in: status.split(',') };
      else where.status = status;
    }
    if (assignedToId) where.assignedToId = parseInt(assignedToId);

    const ruleFilter = {};
    if (pabrik_id) ruleFilter.pabrik_id = parseInt(pabrik_id);
    if (subArea) ruleFilter.subArea = { contains: subArea, mode: 'insensitive' };
    if (criticality) ruleFilter.criticality = criticality;
    if (equipmentCat) ruleFilter.equipmentCat = equipmentCat;
    if (Object.keys(ruleFilter).length > 0) where.rule = ruleFilter;

    const occurrences = await prisma.pdmScheduleOccurrence.findMany({
      where,
      include: {
        rule: { include: { pabrik: true } },
        assignedTo: { select: { id: true, name: true, npk: true, position: true } },
        picHistories: {
          include: {
            fromPic: { select: { id: true, name: true } },
            toPic: { select: { id: true, name: true } },
            changedBy: { select: { id: true, name: true } }
          },
          orderBy: { changedAt: 'desc' }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    // Cek dan update overdue
    const now = new Date();
    const updated = occurrences.map(occ => {
      if (!['COMPLETED', 'CANCELLED'].includes(occ.status)) {
        const diffDays = Math.floor((now - new Date(occ.scheduledDate)) / (1000 * 60 * 60 * 24));
        const isOverdue = diffDays > 0;
        const isOverdue4 = diffDays > 4;
        return { ...occ, isOverdue, isOverdue4, daysLate: diffDays };
      }
      return { ...occ, isOverdue: false, isOverdue4: false, daysLate: 0 };
    });

    res.json(updated);
  } catch (err) {
    console.error('getOccurrences error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const manpowerId = req.user?.man_power_id;
    if (!manpowerId) return res.status(403).json({ error: 'User tidak terhubung ke manpower' });

    const { year, month } = req.query;
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;

    const occurrences = await prisma.pdmScheduleOccurrence.findMany({
      where: {
        assignedToId: parseInt(manpowerId),
        year: y,
        month: m,
        status: { in: ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'] }
      },
      include: {
        rule: { include: { pabrik: true } },
        assignedTo: { select: { id: true, name: true, position: true } },
        picHistories: {
          include: {
            fromPic: { select: { id: true, name: true } },
            toPic: { select: { id: true, name: true } }
          },
          orderBy: { changedAt: 'desc' }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    const result = occurrences.map(occ => {
      const diffDays = Math.floor((now - new Date(occ.scheduledDate)) / (1000 * 60 * 60 * 24));
      return { ...occ, daysLate: diffDays > 0 ? diffDays : 0, isOverdue: diffDays > 0, isOverdue4: diffDays > 4 };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper: build strict area filter dari sub_area string
// "P6 PPHS & OSBL" → exact subArea equals match agar tidak cross ke "Utility & Urea"
function buildStrictAreaFilter(userSubArea) {
  if (!userSubArea) return null;
  const norm = userSubArea.trim();
  const match = norm.match(/^(?:Pabrik\s+|P)(\d[A-Z]?)\s+(.+)$/i);
  if (match) {
    return {
      rule: {
        pabrik: { nama_pabrik: { contains: match[1], mode: 'insensitive' } },
        subArea: { equals: match[2].trim(), mode: 'insensitive' } // exact ≠ contains
      }
    };
  }
  return { rule: { subArea: { equals: norm, mode: 'insensitive' } } };
}

export const getJobBoardTasksForUser = async (user, year, month) => {
  const y = year ? parseInt(year) : new Date().getFullYear();
  const m = month ? parseInt(month) : new Date().getMonth() + 1;

  // Manual extract getUserAreaContext logic since we only have user object
  const manpowerId = user?.man_power_id || null;
  const role = (user?.role || '').toLowerCase();
  const isAdmin = ['admin', 'superadmin', 'manager', 'supervisor', 'vp', 'avp'].includes(role);
  let userSubArea = '';

  if (manpowerId) {
    const mp = await prisma.manPower.findUnique({ where: { id: parseInt(manpowerId) }, select: { sub_area: true } });
    if (mp) userSubArea = mp.sub_area;
  }

  const isAnalyst = role === 'analyst';

  let filterByRoster = {};
  if (!isAdmin) {
    const myRules = await prisma.pdmScheduleRule.findMany({
      where: { isActive: true },
      include: { monthlyPicOverrides: { where: { year: y, month: m } } }
    });      
    const myAreas = new Set();
    for (const r of myRules) {
      const mo = r.monthlyPicOverrides[0];
      let assignedHere = false;
      
      if (mo) {
        const hasOverrideAssignee = mo.picId || (mo.picIds && mo.picIds.length > 0) || (mo.dataCollectorIds && mo.dataCollectorIds.length > 0) || (mo.gtgDataCollectorIds && mo.gtgDataCollectorIds.length > 0);
        if (hasOverrideAssignee) {
          if (mo.picId === manpowerId || (mo.picIds||[]).includes(manpowerId) || (mo.dataCollectorIds||[]).includes(manpowerId) || (mo.gtgDataCollectorIds||[]).includes(manpowerId)) {
             assignedHere = true;
          }
        } else {
          if (r.defaultPicId === manpowerId || (r.defaultPicIds||[]).includes(manpowerId) || (r.defaultDataCollectorIds||[]).includes(manpowerId) || (r.defaultGtgDataCollectorIds||[]).includes(manpowerId)) {
             assignedHere = true;
          }
        }
      } else {
        if (r.defaultPicId === manpowerId || (r.defaultPicIds||[]).includes(manpowerId) || (r.defaultDataCollectorIds||[]).includes(manpowerId) || (r.defaultGtgDataCollectorIds||[]).includes(manpowerId)) {
           assignedHere = true;
        }
      }

      if (assignedHere) {
         const isPphsRule = (r.subArea || '').toUpperCase().includes('PPHS');
         myAreas.add(`${r.pabrik_id}_${isPphsRule ? 'PPHS' : 'NORMAL'}`);
      }
    }
    
    const areaArray = Array.from(myAreas);
    if (areaArray.length > 0) {
       const orConditions = areaArray.map(areaKey => {
          const [pid, type] = areaKey.split('_');
          if (type === 'PPHS') {
             return { pabrik_id: parseInt(pid), subArea: { contains: 'PPHS', mode: 'insensitive' } };
          } else {
             return { pabrik_id: parseInt(pid), NOT: { subArea: { contains: 'PPHS', mode: 'insensitive' } } };
          }
       });
       filterByRoster = { rule: { OR: orConditions } };
    } else {
       const fallbackArea = buildStrictAreaFilter(userSubArea);
       filterByRoster = fallbackArea || { id: -1 };
    }
  }

  const dcWhere = {
    status: 'SCHEDULED',
    workflowStage: 'DC_COLLECTION',
    year: y, month: m,
    ...(!isAdmin ? filterByRoster : {})
  };

  const analystWhere = {
    workflowStage: 'ANALYSIS',
    analystId: null,
    year: y, month: m,
    ...(!isAdmin ? filterByRoster : {})
  };

  const [dcTasks, analysisTasks] = await Promise.all([
    prisma.pdmScheduleOccurrence.findMany({
      where: dcWhere,
      include: {
        rule: { include: { pabrik: true } },
        dataCollector: { select: { id: true, name: true, npk: true } },
        analyst: { select: { id: true, name: true, npk: true } },
      },
      orderBy: { scheduledDate: 'asc' }
    }),
    (isAnalyst || isAdmin) ? prisma.pdmScheduleOccurrence.findMany({
      where: analystWhere,
      include: {
        rule: { include: { pabrik: true } },
        dataCollector: { select: { id: true, name: true, npk: true } },
        analyst: { select: { id: true, name: true, npk: true } },
      },
      orderBy: { scheduledDate: 'asc' }
    }) : Promise.resolve([])
  ]);

  return { dcTasks, analysisTasks, isAnalyst };
};

export const getJobBoard = async (req, res) => {
  try {
    const { year, month } = req.query;
    const { dcTasks, analysisTasks, isAnalyst } = await getJobBoardTasksForUser(req.user, year, month);

    res.json({
      dcTasks,
      analysisTasks,
      items: isAnalyst ? analysisTasks : dcTasks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// STATUS TRANSITIONS
// ============================================================

export const claimTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { manpowerId, userSubArea, userRole, isAdmin } = await getUserAreaContext(req);
    if (!manpowerId) return res.status(403).json({ error: 'User tidak terhubung ke manpower' });

    const occ = await prisma.pdmScheduleOccurrence.findUnique({
      where: { id: parseInt(id) },
      include: { rule: { include: { pabrik: true } } }
    });
    if (!occ) return res.status(404).json({ error: 'Task tidak ditemukan' });

    const taskStage = occ.workflowStage;
    const taskSubArea = occ.rule?.subArea;
    const taskPabrikNama = occ.rule?.pabrik?.nama_pabrik || '';
    const role = (userRole || '').toLowerCase();

    // Validasi: status harus SCHEDULED (untuk DC) atau ANALYSIS tanpa analystId (untuk Analyst)
    const isDcClaim = taskStage === 'DC_COLLECTION' && occ.status === 'SCHEDULED';
    const isAnalystClaim = taskStage === 'ANALYSIS' && !occ.analystId;

    if (!isDcClaim && !isAnalystClaim) {
      return res.status(400).json({
        error: isDcClaim === false && taskStage === 'DC_COLLECTION'
          ? 'Task sudah di-claim atau tidak tersedia'
          : taskStage === 'ANALYSIS'
            ? 'Task analisis ini sudah memiliki analyst'
            : `Task tidak dapat di-claim pada stage ini (${taskStage})`
      });
    }

    // Allow analyst to claim DC task ONLY if it is a compressor
    const isCompressor = taskSubArea && taskSubArea.toLowerCase().includes('compressor');

    if (!isAdmin) {
      if (isAnalystClaim && role !== 'analyst') {
        return res.status(403).json({ error: 'Hanya Analyst yang dapat mengambil task analisis' });
      }
      if (isDcClaim && role === 'analyst' && !isCompressor) {
        return res.status(403).json({ error: 'Analyst tidak dapat mengambil task Data Collection (kecuali Compressor)' });
      }
    }

    // Guard area:
    if (!isAdmin) {
      const hasDelegation = await hasCrossDelegation(manpowerId, parseInt(id));

      if (!hasDelegation) {
        const myRules = await prisma.pdmScheduleRule.findMany({
          where: { isActive: true },
          include: { monthlyPicOverrides: { where: { year: occ.year, month: occ.month } } }
        });

        let isAssignedToThisArea = false;
        const occIsPphs = (occ.rule.subArea || '').toUpperCase().includes('PPHS');

        for (const r of myRules) {
          const mo = r.monthlyPicOverrides[0];
          let assignedHere = false;
          
          if (mo) {
            const hasOverrideAssignee = mo.picId || (mo.picIds && mo.picIds.length > 0) || (mo.dataCollectorIds && mo.dataCollectorIds.length > 0) || (mo.gtgDataCollectorIds && mo.gtgDataCollectorIds.length > 0);
            if (hasOverrideAssignee) {
              if (mo.picId === manpowerId || (mo.picIds||[]).includes(manpowerId) || (mo.dataCollectorIds||[]).includes(manpowerId) || (mo.gtgDataCollectorIds||[]).includes(manpowerId)) assignedHere = true;
            } else {
              if (r.defaultPicId === manpowerId || (r.defaultPicIds||[]).includes(manpowerId) || (r.defaultDataCollectorIds||[]).includes(manpowerId) || (r.defaultGtgDataCollectorIds||[]).includes(manpowerId)) assignedHere = true;
            }
          } else {
            if (r.defaultPicId === manpowerId || (r.defaultPicIds||[]).includes(manpowerId) || (r.defaultDataCollectorIds||[]).includes(manpowerId) || (r.defaultGtgDataCollectorIds||[]).includes(manpowerId)) assignedHere = true;
          }

          if (assignedHere && r.pabrik_id === occ.rule.pabrik_id) {
             const rIsPphs = (r.subArea || '').toUpperCase().includes('PPHS');
             if (rIsPphs === occIsPphs) {
                 isAssignedToThisArea = true;
                 break;
             }
          }
        }

        if (!isAssignedToThisArea) {
           return res.status(403).json({
             error: `Anda tidak terdaftar di Roster untuk mengambil task di area ini (${taskPabrikNama} ${occIsPphs ? 'PPHS' : 'Utama'}).`
           });
        }
      }
    }

    // Set field yang tepat sesuai stage:
    const updateData = {
      assignedToId: parseInt(manpowerId),
      status: 'ASSIGNED',
      claimedAt: new Date()
    };
    if (isDcClaim) {
      updateData.dataCollectorId = parseInt(manpowerId);
      // Jika Analyst yang claim task DC (karena compressor), auto assign juga sbg analyst
      if (role === 'analyst' && isCompressor) {
        updateData.analystId = parseInt(manpowerId);
      }
    } else if (isAnalystClaim) {
      updateData.analystId = parseInt(manpowerId);
    }

    const updated = await prisma.pdmScheduleOccurrence.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        rule: { include: { pabrik: true } },
        assignedTo: { select: { id: true, name: true } },
        dataCollector: { select: { id: true, name: true } },
        analyst: { select: { id: true, name: true } }
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const startTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { activityNote } = req.body;
    const { manpowerId, isAdmin } = await getUserAreaContext(req);

    const occ = await prisma.pdmScheduleOccurrence.findUnique({ where: { id: parseInt(id) } });
    if (!occ) return res.status(404).json({ error: 'Task tidak ditemukan' });
    if (!['ASSIGNED', 'ON_HOLD'].includes(occ.status)) return res.status(400).json({ error: `Status saat ini: ${occ.status}` });

    // Guard: hanya PIC atau admin yang bisa mulai task
    if (!await canWriteOccurrence(manpowerId, isAdmin, occ)) {
      return res.status(403).json({ error: 'Anda bukan PIC task ini. Hanya PIC atau Admin yang dapat mengubah status.' });
    }

    const now = new Date();
    const [updated] = await prisma.$transaction([
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: { status: 'IN_PROGRESS', startedAt: occ.startedAt || now, actualDate: now },
        include: { rule: { include: { pabrik: true } }, assignedTo: { select: { id: true, name: true } } }
      }),
      prisma.pdmDailyActivity.create({
        data: {
          occurrenceId: parseInt(id),
          workDate: now,
          startTime: now,
          activityNote,
          statusSnapshot: 'IN_PROGRESS',
          performedById: manpowerId || null
        }
      })
    ]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const holdTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { activityNote } = req.body;
    const { manpowerId, isAdmin } = await getUserAreaContext(req);

    const occ = await prisma.pdmScheduleOccurrence.findUnique({ where: { id: parseInt(id) } });
    if (!occ || occ.status !== 'IN_PROGRESS') return res.status(400).json({ error: 'Task tidak sedang in-progress' });

    // Guard: hanya PIC atau admin
    if (!await canWriteOccurrence(manpowerId, isAdmin, occ)) {
      return res.status(403).json({ error: 'Anda bukan PIC task ini. Hanya PIC atau Admin yang dapat mengubah status.' });
    }

    const now = new Date();
    const lastActivity = await prisma.pdmDailyActivity.findFirst({
      where: { occurrenceId: parseInt(id), endTime: null },
      orderBy: { startTime: 'desc' }
    });
    
    const ops = [
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: { status: 'ON_HOLD' },
        include: { rule: { include: { pabrik: true } } }
      })
    ];

    if (lastActivity) {
      const duration = Math.floor((now - new Date(lastActivity.startTime)) / 60000);
      ops.push(prisma.pdmDailyActivity.update({
        where: { id: lastActivity.id },
        data: { endTime: now, durationMinutes: duration, activityNote: activityNote || lastActivity.activityNote, statusSnapshot: 'ON_HOLD' }
      }));
    }

    const [updated] = await prisma.$transaction(ops);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { activityNote } = req.body;
    const { manpowerId, isAdmin } = await getUserAreaContext(req);

    const occ = await prisma.pdmScheduleOccurrence.findUnique({ where: { id: parseInt(id) } });
    if (!occ || !['IN_PROGRESS', 'ASSIGNED', 'ON_HOLD'].includes(occ.status)) {
      return res.status(400).json({ error: 'Task tidak dapat diselesaikan dari status ini' });
    }

    // Guard: hanya PIC atau admin
    if (!await canWriteOccurrence(manpowerId, isAdmin, occ)) {
      return res.status(403).json({ error: 'Anda bukan PIC task ini. Hanya PIC atau Admin yang dapat menyelesaikan task.' });
    }

    const now = new Date();
    const lastActivity = await prisma.pdmDailyActivity.findFirst({
      where: { occurrenceId: parseInt(id), endTime: null },
      orderBy: { startTime: 'desc' }
    });
    
    const ops = [
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: { status: 'COMPLETED', completedAt: now, isOverdue: false },
        include: { rule: { include: { pabrik: true } }, assignedTo: { select: { id: true, name: true } } }
      })
    ];

    if (lastActivity) {
      const duration = Math.floor((now - new Date(lastActivity.startTime)) / 60000);
      ops.push(prisma.pdmDailyActivity.update({
        where: { id: lastActivity.id },
        data: { endTime: now, durationMinutes: duration, activityNote: activityNote || lastActivity.activityNote, statusSnapshot: 'COMPLETED' }
      }));
    }

    const [updated] = await prisma.$transaction(ops);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { isAdmin } = await getUserAreaContext(req);

    // Hanya admin/supervisor yang bisa cancel
    if (!isAdmin) {
      return res.status(403).json({ error: 'Hanya Admin atau Supervisor yang dapat membatalkan task' });
    }

    const updated = await prisma.pdmScheduleOccurrence.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED', cancelReason: reason || 'Dibatalkan' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reassignPic = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPicId, reason } = req.body;
    const manpowerId = req.user?.man_power_id;
    const role = (req.user?.role || '').toLowerCase();

    if (!newPicId || !reason) return res.status(400).json({ error: 'newPicId dan reason wajib diisi' });

    const occ = await prisma.pdmScheduleOccurrence.findUnique({ 
      where: { id: parseInt(id) },
      include: { rule: { include: { pabrik: true } } }
    });
    if (!occ) return res.status(404).json({ error: 'Occurrence tidak ditemukan' });
    if (['COMPLETED', 'CANCELLED'].includes(occ.status)) return res.status(400).json({ error: 'Task sudah selesai/dibatalkan' });

    // Validate area for analyst
    if (role === 'analyst') {
      const newPic = await prisma.manPower.findUnique({ where: { id: parseInt(newPicId) } });
      if (!newPic) return res.status(404).json({ error: 'Personel PIC baru tidak ditemukan' });
      
      const occArea = `${occ.rule?.pabrik?.nama_pabrik || ''} ${occ.rule?.subArea || ''}`.trim().toLowerCase();
      const mArea = (newPic.sub_area || '').toLowerCase();
      
      if (mArea !== occArea) {
        return res.status(403).json({ error: `Akses ditolak: Anda hanya dapat menugaskan PIC yang berada di area task ini (${occArea})` });
      }
    }

    const [updated] = await prisma.$transaction([
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: { assignedToId: parseInt(newPicId), status: 'ASSIGNED' },
        include: { assignedTo: { select: { id: true, name: true } }, rule: { include: { pabrik: true } } }
      }),
      prisma.pdmPicHistory.create({
        data: {
          occurrenceId: parseInt(id),
          fromPicId: occ.assignedToId,
          toPicId: parseInt(newPicId),
          reason,
          changedById: manpowerId ? parseInt(manpowerId) : parseInt(newPicId),
        }
      })
    ]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// DASHBOARD STATS
// ============================================================

export const getDashboardStats = async (req, res) => {
  try {
    const { year, month, pabrik_id } = req.query;
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;

    const baseWhere = { year: y, month: m };
    if (pabrik_id) baseWhere.rule = { pabrik_id: parseInt(pabrik_id) };

    const [total, completed, inProgress, onHold, assigned, scheduled] = await Promise.all([
      prisma.pdmScheduleOccurrence.count({ where: baseWhere }),
      prisma.pdmScheduleOccurrence.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
      prisma.pdmScheduleOccurrence.count({ where: { ...baseWhere, status: 'IN_PROGRESS' } }),
      prisma.pdmScheduleOccurrence.count({ where: { ...baseWhere, status: 'ON_HOLD' } }),
      prisma.pdmScheduleOccurrence.count({ where: { ...baseWhere, status: 'ASSIGNED' } }),
      prisma.pdmScheduleOccurrence.count({ where: { ...baseWhere, status: 'SCHEDULED' } }),
    ]);

    // Hitung overdue dari semua yg belum selesai
    const allPending = await prisma.pdmScheduleOccurrence.findMany({
      where: { ...baseWhere, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      select: { scheduledDate: true }
    });
    const overdue = allPending.filter(o => Math.floor((now - new Date(o.scheduledDate)) / 86400000) > 0).length;
    const overdue4 = allPending.filter(o => Math.floor((now - new Date(o.scheduledDate)) / 86400000) > 4).length;

    res.json({ total, completed, inProgress, onHold, assigned, scheduled, overdue, overdue4 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ambil history PIC per occurrence
export const getPicHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await prisma.pdmPicHistory.findMany({
      where: { occurrenceId: parseInt(id) },
      include: {
        fromPic: { select: { id: true, name: true } },
        toPic: { select: { id: true, name: true } },
        changedBy: { select: { id: true, name: true } }
      },
      orderBy: { changedAt: 'asc' }
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// MONTHLY PIC OVERRIDE
// ============================================================
export const setMonthlyPicOverride = async (req, res) => {
  try {
    const { ruleId, year, month, picId } = req.body;
    if (!ruleId || !year || !month || !picId) return res.status(400).json({ error: 'Semua field wajib diisi' });
    const override = await prisma.pdmRuleMonthlyPic.upsert({
      where: { ruleId_year_month: { ruleId: parseInt(ruleId), year: parseInt(year), month: parseInt(month) } },
      update: { picId: parseInt(picId) },
      create: { ruleId: parseInt(ruleId), year: parseInt(year), month: parseInt(month), picId: parseInt(picId) }
    });
    res.json(override);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// COMPLETION BY PABRIK (chart per pabrik)
// ============================================================
export const getCompletionByPabrik = async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;

    const occurrences = await prisma.pdmScheduleOccurrence.findMany({
      where: { year: y, month: m },
      select: {
        status: true,
        scheduledDate: true,
        rule: { select: { subArea: true, pabrik: { select: { id: true, nama_pabrik: true } } } }
      }
    });

    const pabrikMap = {};
    for (const occ of occurrences) {
      const pabrik = occ.rule?.pabrik;
      if (!pabrik) continue;

      const key = pabrik.id.toString();
      const nama = pabrik.nama_pabrik;

      if (!pabrikMap[key]) {
        pabrikMap[key] = { id: key, nama_pabrik: nama, total: 0, completed: 0, overdue: 0 };
      }
      pabrikMap[key].total++;
      if (occ.status === 'COMPLETED') pabrikMap[key].completed++;
      if (!['COMPLETED', 'CANCELLED'].includes(occ.status)) {
        const diffDays = Math.floor((now - new Date(occ.scheduledDate)) / 86400000);
        if (diffDays > 0) pabrikMap[key].overdue++;
      }
    }

    const result = Object.values(pabrikMap).map(p => ({
      ...p,
      completionRate: p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0
    })).sort((a, b) => a.nama_pabrik.localeCompare(b.nama_pabrik));

    res.json(result);
  } catch (err) {
    console.error('getCompletionByPabrik error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// ROSTER PIC per PABRIK per CRITICALITY
// ============================================================
export const getRoster = async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;

    // Ambil semua rules aktif beserta override bulan ini
    const rules = await prisma.pdmScheduleRule.findMany({
      where: { isActive: true },
      include: {
        pabrik: { select: { id: true, nama_pabrik: true } },
        defaultPic: { select: { id: true, name: true, npk: true, position: true } },
        monthlyPicOverrides: {
          where: { year: y, month: m },
          include: {
            pic: { select: { id: true, name: true, npk: true, position: true } }
          }
        }
      },
      orderBy: [{ pabrik_id: 'asc' }, { criticality: 'asc' }, { subArea: 'asc' }]
    });

    // Fetch all manpowers to resolve array IDs to names
    const allManpower = await prisma.manPower.findMany({
      where: { is_active: true },
      select: { id: true, name: true, npk: true, position: true }
    });
    const mpMap = new Map(allManpower.map(m => [m.id, m]));

    // Kelompokkan per pabrik per criticality
    const pabrikMap = {}; // key: pabrik_id

    for (const rule of rules) {
      const pid = rule.pabrik_id.toString();
      const pNama = rule.pabrik?.nama_pabrik || '-';

      if (!pabrikMap[pid]) {
        pabrikMap[pid] = {
          pabrik_id: pid,
          nama_pabrik: pNama,
          critical: [],   // list { rule_id, subArea, pic, hasOverride }
          nonCritical: [] // list { rule_id, subArea, pic, hasOverride }
        };
      }

      // Tentukan PIC: override bulan ini > default PIC
      const override = rule.monthlyPicOverrides[0];
      const effectivePic = override?.pic || rule.defaultPic || null;
      const hasOverride = !!override;
      
      const effectivePics = override?.picIds?.length > 0 
        ? override.picIds.map(id => mpMap.get(id)).filter(Boolean)
        : (rule.defaultPicIds?.length > 0 
            ? rule.defaultPicIds.map(id => mpMap.get(id)).filter(Boolean) 
            : (effectivePic ? [effectivePic] : []));

      const entry = {
        rule_id: rule.id,
        code: rule.code,
        subArea: rule.subArea || rule.taskName,
        taskName: rule.taskName,
        is_gtg: rule.is_gtg,
        pic: effectivePic,
        pics: effectivePics,
        dataCollectors: (override && override.dataCollectorIds ? override.dataCollectorIds : (rule.defaultDataCollectorIds || [])).map(id => mpMap.get(id)).filter(Boolean),
        gtgDataCollectors: (override && override.gtgDataCollectorIds ? override.gtgDataCollectorIds : (rule.defaultGtgDataCollectorIds || [])).map(id => mpMap.get(id)).filter(Boolean),
        hasOverride,
        overrideId: override?.id || null
      };

      if (rule.criticality === 'CRITICAL') {
        pabrikMap[pid].critical.push(entry);
      } else {
        pabrikMap[pid].nonCritical.push(entry);
      }
    }

    // Buat ringkasan PIC unik per pabrik per criticality (untuk tampilan tabel ringkas)
    const result = Object.values(pabrikMap)
      .sort((a, b) => a.nama_pabrik.localeCompare(b.nama_pabrik))
      .map(p => {
        // Deduplikasi PIC per criticality
        const criticalPics = [];
        const seenC = new Set();
        for (const e of p.critical) {
          if (e.pics && e.pics.length > 0) {
            for (const pic of e.pics) {
              if (!seenC.has(pic.id)) {
                seenC.add(pic.id);
                criticalPics.push(pic);
              }
            }
          }
        }

        const nonCriticalPics = [];
        const seenNC = new Set();
        for (const e of p.nonCritical) {
          if (e.pics && e.pics.length > 0) {
            for (const pic of e.pics) {
              if (!seenNC.has(pic.id)) {
                seenNC.add(pic.id);
                nonCriticalPics.push(pic);
              }
            }
          }
          e.dataCollectors.forEach(dc => {
            if (!seenNC.has(dc.id)) {
              seenNC.add(dc.id);
              nonCriticalPics.push(dc);
            }
          });
          e.gtgDataCollectors.forEach(dc => {
            if (!seenNC.has(dc.id)) {
              seenNC.add(dc.id);
              nonCriticalPics.push(dc);
            }
          });
        }

        return {
          pabrik_id: p.pabrik_id,
          nama_pabrik: p.nama_pabrik,
          critical: p.critical,
          nonCritical: p.nonCritical,
          criticalPicsSummary: criticalPics,
          nonCriticalPicsSummary: nonCriticalPics,
        };
      });

    res.json({ year: y, month: m, data: result });
  } catch (err) {
    console.error('getRoster error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// BULK MONTHLY PIC OVERRIDE (set untuk range bulan sekaligus)
// ============================================================
export const setMonthlyPicBulk = async (req, res) => {
  try {
    const { entries } = req.body;
    // entries: [{ ruleId, year, month, picId }, ...]
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'entries wajib diisi (array)' });
    }

    const ops = entries.map(e => {
      // Pastikan dataCollectorIds & gtgDataCollectorIds & picIds tersimpan sebagai array
      const picIdVal = e.picId ? parseInt(e.picId) : null;
      const pIds = Array.isArray(e.picIds) ? e.picIds.map(id => parseInt(id)).filter(id => !isNaN(id)) : [];
      const dcIds = Array.isArray(e.dataCollectorIds) ? e.dataCollectorIds.map(id => parseInt(id)).filter(id => !isNaN(id)) : [];
      const gtgIds = Array.isArray(e.gtgDataCollectorIds) ? e.gtgDataCollectorIds.map(id => parseInt(id)).filter(id => !isNaN(id)) : [];
      
      return prisma.pdmRuleMonthlyPic.upsert({
        where: {
          ruleId_year_month: {
            ruleId: parseInt(e.ruleId),
            year: parseInt(e.year),
            month: parseInt(e.month)
          }
        },
        update: { picId: picIdVal, picIds: pIds, dataCollectorIds: dcIds, gtgDataCollectorIds: gtgIds },
        create: {
          ruleId: parseInt(e.ruleId),
          year: parseInt(e.year),
          month: parseInt(e.month),
          picId: picIdVal,
          picIds: pIds,
          dataCollectorIds: dcIds,
          gtgDataCollectorIds: gtgIds
        }
      });
    });

    const results = await prisma.$transaction(ops);
    res.json({ message: `${results.length} override berhasil disimpan`, count: results.length });
  } catch (err) {
    console.error('setMonthlyPicBulk error:', err);
    res.status(500).json({ error: err.message });
  }
};
