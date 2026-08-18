import prisma from '../utils/prisma.js';
import { getUserAreaContext, canWriteOccurrence } from './pdmAccessControl.js';

// ============================================================
// AVP ROUTING: Pabrik code prefix → AVP role
// ============================================================
const AVP_ROUTING = {
  // P1A, P3, P4, P7 → AVP Rotating 1
  'pabrik 1': 'avp_rotating1', 'p1': 'avp_rotating1', 'p3': 'avp_rotating1',
  'p4': 'avp_rotating1', 'p7': 'avp_rotating1',
  // P2, P5 (Utility, Urea, BB) → AVP Rotating 2
  'p2': 'avp_rotating2', 'p5': 'avp_rotating2',
  // P6 PPHS & OSBL → AVP PPHS
  'p6': 'avp_pphs',
};

function getAvpRole(pabrikName) {
  if (!pabrikName) return null;
  const name = pabrikName.toLowerCase();
  for (const [key, role] of Object.entries(AVP_ROUTING)) {
    if (name.includes(key)) return role;
  }
  return null;
}

async function findAvpManpower(pabrikName) {
  const avpMapping = getAvpRole(pabrikName);
  if (!avpMapping) return null;
  
  let keyword = '';
  if (avpMapping === 'avp_rotating1') keyword = 'Rotating 1';
  else if (avpMapping === 'avp_rotating2') keyword = 'Rotating 2';
  else if (avpMapping === 'avp_pphs') keyword = 'PPHS';
  else return null;

  const user = await prisma.user.findFirst({
    where: { 
      role: 'avp', 
      man_power_id: { not: null },
      man_power: { position: { contains: keyword, mode: 'insensitive' } }
    },
    select: { man_power_id: true }
  });
  return user?.man_power_id || null;
}

// Helper: catat log workflow
function logWorkflow(occurrenceId, fromStage, toStage, action, actorId, notes, tx = prisma) {
  return tx.pdmWorkflowLog.create({
    data: { occurrenceId, fromStage, toStage, action, actorId, notes }
  });
}

// Helper: tutup daily activity yang masih terbuka & hitung durasi
async function closeOpenActivity(occurrenceId, actorId, statusSnapshot, workflowStage, note, tx = prisma) {
  const lastActivity = await tx.pdmDailyActivity.findFirst({
    where: { occurrenceId, endTime: null },
    orderBy: { startTime: 'desc' }
  });
  if (!lastActivity) return 0;
  const now = new Date();
  const duration = Math.floor((now - new Date(lastActivity.startTime)) / 60000);
  await tx.pdmDailyActivity.update({
    where: { id: lastActivity.id },
    data: { endTime: now, durationMinutes: duration, statusSnapshot, workflowStage, activityNote: note || lastActivity.activityNote }
  });
  return duration;
}

// ============================================================
// STAGE 1 → 2: Data Collection Finish
// ============================================================
export const finishDataCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const manpowerId = req.user?.man_power_id;

    const occ = await prisma.pdmScheduleOccurrence.findUnique({
      where: { id: parseInt(id) },
      include: {
        rule: { include: { pabrik: true } },
        analyst: true,
      }
    });

    // Re-fetch with proper include
    const occFull = await prisma.pdmScheduleOccurrence.findUnique({
      where: { id: parseInt(id) },
      include: { 
        rule: { 
          include: { 
            pabrik: true,
            monthlyPicOverrides: true
          } 
        } 
      }
    });

    if (!occFull) return res.status(404).json({ error: 'Task tidak ditemukan' });
    if (occFull.workflowStage !== 'DC_COLLECTION') {
      return res.status(400).json({ error: `Task sedang di stage ${occFull.workflowStage}, bukan DC_COLLECTION` });
    }
    if (!['IN_PROGRESS', 'ASSIGNED', 'ON_HOLD'].includes(occFull.status)) {
      return res.status(400).json({ error: 'Task harus dimulai dulu sebelum bisa diselesaikan' });
    }

    // Guard: hanya DC PIC atau admin yang boleh selesaikan DC
    const { isAdmin } = await getUserAreaContext(req);
    if (!await canWriteOccurrence(manpowerId, isAdmin, occFull, 'DC')) {
      return res.status(403).json({ error: 'Anda bukan Data Collector task ini. Hanya PIC DC atau Admin yang dapat menyelesaikan tahap ini.' });
    }

    const now = new Date();

    const ops = [];

    // Hitung hold jika masih IN_PROGRESS
    let holdDuration = 0;
    if (occFull.status === 'IN_PROGRESS') {
      holdDuration = await closeOpenActivity(parseInt(id), manpowerId, 'COMPLETED', 'DC_COLLECTION', notes);
    }

    // Tentukan analyst: pakai analystId jika ada, jika tidak pakai override picId, lalu defaultPicId dari rule
    const override = occFull.rule?.monthlyPicOverrides?.find(o => o.year === occFull.year && o.month === occFull.month);
    const defaultPicId = override?.picId || occFull.rule?.defaultPicId;
    const nextAssignedToId = occFull.analystId || defaultPicId || null;
    const nextStatus = nextAssignedToId ? 'ASSIGNED' : 'SCHEDULED';

    ops.push(
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: {
          workflowStage: 'ANALYSIS',
          dcFinishedAt: now,
          status: nextStatus,
          assignedToId: nextAssignedToId,
          totalHoldMinutes: { increment: holdDuration }
        },
        include: { rule: { include: { pabrik: true } }, assignedTo: true, dataCollector: true, analyst: true }
      }),
      logWorkflow(parseInt(id), 'DC_COLLECTION', 'ANALYSIS', 'DC_FINISH', manpowerId, notes)
    );

    const [updated] = await prisma.$transaction(ops);
    res.json(updated);
  } catch (err) {
    console.error('finishDataCollection error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// STAGE 2: Analysis Start / Hold / Finish
// ============================================================
export const startAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const manpowerId = req.user?.man_power_id;

    const occ = await prisma.pdmScheduleOccurrence.findUnique({ where: { id: parseInt(id) } });
    if (!occ) return res.status(404).json({ error: 'Task tidak ditemukan' });
    if (occ.workflowStage !== 'ANALYSIS') return res.status(400).json({ error: 'Task tidak di stage ANALYSIS' });
    if (occ.status === 'IN_PROGRESS') return res.status(400).json({ error: 'Analisis sudah dimulai' });

    const now = new Date();
    const [updated] = await prisma.$transaction([
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: {
          status: 'IN_PROGRESS',
          analysisStartedAt: occ.analysisStartedAt || now,
          analystId: manpowerId ? parseInt(manpowerId) : occ.analystId
        },
        include: { rule: { include: { pabrik: true } }, assignedTo: true, analyst: true }
      }),
      prisma.pdmDailyActivity.create({
        data: {
          occurrenceId: parseInt(id),
          workDate: now,
          startTime: now,
          activityNote: notes || 'Analisis dimulai',
          statusSnapshot: 'IN_PROGRESS',
          workflowStage: 'ANALYSIS',
          performedById: manpowerId ? parseInt(manpowerId) : null
        }
      }),
      logWorkflow(parseInt(id), 'ANALYSIS', 'ANALYSIS', 'ANALYSIS_START', manpowerId, notes)
    ]);
    res.json(updated);
  } catch (err) {
    console.error('startAnalysis error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const finishAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const manpowerId = req.user?.man_power_id;

    const occ = await prisma.pdmScheduleOccurrence.findUnique({
      where: { id: parseInt(id) },
      include: { rule: { include: { pabrik: true } } }
    });
    if (!occ) return res.status(404).json({ error: 'Task tidak ditemukan' });
    if (occ.workflowStage !== 'ANALYSIS') return res.status(400).json({ error: 'Task tidak di stage ANALYSIS' });

    // Guard: hanya Analyst PIC atau admin
    const { isAdmin } = await getUserAreaContext(req);
    if (!await canWriteOccurrence(manpowerId, isAdmin, occ, 'ANALYST')) {
      return res.status(403).json({ error: 'Anda bukan Analyst task ini. Hanya Analyst PIC atau Admin yang dapat menyelesaikan analisis.' });
    }

    const now = new Date();
    let holdDuration = 0;
    if (occ.status === 'IN_PROGRESS') {
      holdDuration = await closeOpenActivity(parseInt(id), manpowerId, 'COMPLETED', 'ANALYSIS', notes);
    }

    // Tentukan AVP berdasarkan pabrik
    const avpId = occ.avpId || await findAvpManpower(occ.rule?.pabrik?.nama_pabrik);

    const [updated] = await prisma.$transaction([
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: {
          workflowStage: 'AVP_APPROVAL',
          analysisFinishedAt: now,
          status: 'ASSIGNED',
          avpId: avpId,
          assignedToId: avpId || occ.assignedToId,
          totalHoldMinutes: { increment: holdDuration }
        },
        include: { rule: { include: { pabrik: true } }, assignedTo: true, analyst: true, avp: true }
      }),
      logWorkflow(parseInt(id), 'ANALYSIS', 'AVP_APPROVAL', 'ANALYSIS_FINISH', manpowerId, notes)
    ]);
    res.json(updated);
  } catch (err) {
    console.error('finishAnalysis error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// STAGE 3: AVP Approve / Reject
// ============================================================
export const avpApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const manpowerId = req.user?.man_power_id;

    const occ = await prisma.pdmScheduleOccurrence.findUnique({ where: { id: parseInt(id) } });
    if (!occ) return res.status(404).json({ error: 'Task tidak ditemukan' });
    if (occ.workflowStage !== 'AVP_APPROVAL') return res.status(400).json({ error: 'Task tidak di stage AVP_APPROVAL' });

    const now = new Date();
    // Kembalikan ke DC asli (dataCollectorId)
    const assignBackTo = occ.dataCollectorId || occ.assignedToId;

    const [updated] = await prisma.$transaction([
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: {
          workflowStage: 'SAP_UPLOAD',
          avpActionAt: now,
          avpId: manpowerId ? parseInt(manpowerId) : occ.avpId,
          status: 'ASSIGNED',
          assignedToId: assignBackTo,
          avpRejectedReason: null
        },
        include: { rule: { include: { pabrik: true } }, dataCollector: true, analyst: true, avp: true }
      }),
      logWorkflow(parseInt(id), 'AVP_APPROVAL', 'SAP_UPLOAD', 'AVP_APPROVE', manpowerId, notes)
    ]);
    res.json(updated);
  } catch (err) {
    console.error('avpApprove error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const avpReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const manpowerId = req.user?.man_power_id;

    if (!reason) return res.status(400).json({ error: 'Alasan penolakan wajib diisi' });

    const occ = await prisma.pdmScheduleOccurrence.findUnique({ where: { id: parseInt(id) } });
    if (!occ) return res.status(404).json({ error: 'Task tidak ditemukan' });
    if (occ.workflowStage !== 'AVP_APPROVAL') return res.status(400).json({ error: 'Task tidak di stage AVP_APPROVAL' });

    const now = new Date();
    const [updated] = await prisma.$transaction([
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: {
          workflowStage: 'ANALYSIS',
          avpActionAt: now,
          avpRejectedReason: reason,
          status: 'ASSIGNED',
          assignedToId: occ.analystId || occ.assignedToId,
          analysisFinishedAt: null // reset so analyst can redo
        },
        include: { rule: { include: { pabrik: true } }, dataCollector: true, analyst: true, avp: true }
      }),
      logWorkflow(parseInt(id), 'AVP_APPROVAL', 'ANALYSIS', 'AVP_REJECT', manpowerId, reason)
    ]);
    res.json(updated);
  } catch (err) {
    console.error('avpReject error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// STAGE 4: SAP Upload (Closure)
// ============================================================
export const markSapUploaded = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const manpowerId = req.user?.man_power_id;

    const occ = await prisma.pdmScheduleOccurrence.findUnique({
      where: { id: parseInt(id) },
      include: { rule: { include: { pabrik: true } }, dataCollector: true, analyst: true }
    });
    if (!occ) return res.status(404).json({ error: 'Task tidak ditemukan' });
    if (occ.workflowStage !== 'SAP_UPLOAD') return res.status(400).json({ error: 'Task tidak di stage SAP_UPLOAD' });

    const now = new Date();

    // Hitung total man-hours efektif
    const allActivities = await prisma.pdmDailyActivity.findMany({
      where: { occurrenceId: parseInt(id), durationMinutes: { not: null } }
    });
    const totalActiveMins = allActivities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
    const effectiveMins = totalActiveMins - occ.totalHoldMinutes;
    const effectiveHours = Math.max(0, effectiveMins / 60);

    const [updated] = await prisma.$transaction([
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: {
          workflowStage: 'CLOSED',
          sapUploadedAt: now,
          status: 'COMPLETED',
          completedAt: now
        },
        include: { rule: { include: { pabrik: true } }, dataCollector: true, analyst: true, avp: true }
      }),
      logWorkflow(parseInt(id), 'SAP_UPLOAD', 'CLOSED', 'SAP_UPLOAD', manpowerId, notes || `Efektif: ${effectiveHours.toFixed(1)} jam`)
    ]);
    res.json({ ...updated, effectiveHours: effectiveHours.toFixed(2) });
  } catch (err) {
    console.error('markSapUploaded error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// HOLD / RESUME dengan alasan wajib
// ============================================================
export const holdWorkflowTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const manpowerId = req.user?.man_power_id;

    if (!reason || !reason.trim()) return res.status(400).json({ error: 'Alasan hold wajib diisi' });

    const occ = await prisma.pdmScheduleOccurrence.findUnique({ where: { id: parseInt(id) } });
    if (!occ || occ.status !== 'IN_PROGRESS') return res.status(400).json({ error: 'Task tidak sedang IN_PROGRESS' });

    const now = new Date();
    const holdDuration = await closeOpenActivity(parseInt(id), manpowerId, 'ON_HOLD', occ.workflowStage, reason);

    const [updated] = await prisma.$transaction([
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: { status: 'ON_HOLD', totalHoldMinutes: { increment: holdDuration } },
        include: { rule: { include: { pabrik: true } } }
      }),
      logWorkflow(parseInt(id), occ.workflowStage, occ.workflowStage, 'HOLD', manpowerId, reason)
    ]);
    res.json(updated);
  } catch (err) {
    console.error('holdWorkflowTask error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const resumeWorkflowTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const manpowerId = req.user?.man_power_id;

    const occ = await prisma.pdmScheduleOccurrence.findUnique({ where: { id: parseInt(id) } });
    if (!occ || occ.status !== 'ON_HOLD') return res.status(400).json({ error: 'Task tidak sedang ON_HOLD' });

    const now = new Date();
    const [updated] = await prisma.$transaction([
      prisma.pdmScheduleOccurrence.update({
        where: { id: parseInt(id) },
        data: { status: 'IN_PROGRESS' },
        include: { rule: { include: { pabrik: true } } }
      }),
      prisma.pdmDailyActivity.create({
        data: {
          occurrenceId: parseInt(id),
          workDate: now,
          startTime: now,
          activityNote: notes || 'Dilanjutkan',
          statusSnapshot: 'IN_PROGRESS',
          workflowStage: occ.workflowStage,
          performedById: manpowerId ? parseInt(manpowerId) : null
        }
      }),
      logWorkflow(parseInt(id), occ.workflowStage, occ.workflowStage, 'RESUME', manpowerId, notes)
    ]);
    res.json(updated);
  } catch (err) {
    console.error('resumeWorkflowTask error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// ASSIGN DC & ANALYST ke Occurrence (dari Roster)
// ============================================================
export const assignWorkflowPersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    const { dataCollectorId, analystId, avpId } = req.body;

    const data = {};
    if (dataCollectorId !== undefined) data.dataCollectorId = dataCollectorId ? parseInt(dataCollectorId) : null;
    if (analystId !== undefined) data.analystId = analystId ? parseInt(analystId) : null;
    if (avpId !== undefined) data.avpId = avpId ? parseInt(avpId) : null;

    const updated = await prisma.pdmScheduleOccurrence.update({
      where: { id: parseInt(id) },
      data,
      include: { rule: { include: { pabrik: true } }, dataCollector: true, analyst: true, avp: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// AREA DASHBOARD — Matrix view per AREA (pabrik + subArea) per stage
// ============================================================
export const getAreaDashboard = async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;

    const { userSubArea } = await getUserAreaContext(req);

    const occurrences = await prisma.pdmScheduleOccurrence.findMany({
      where: { year: y, month: m },
      include: {
        rule: { include: { pabrik: true } },
        dataCollector: { select: { id: true, name: true, npk: true } },
        analyst: { select: { id: true, name: true, npk: true } },
        avp: { select: { id: true, name: true, npk: true } }
      },
      orderBy: [{ rule: { pabrik_id: 'asc' } }, { rule: { subArea: 'asc' } }, { scheduledDate: 'asc' }]
    });

    // Group by pabrik_id + subArea (composite key) — ensures P6 PPHS & OSBL and P6 Utility are separate
    const areaMap = {};
    for (const occ of occurrences) {
      const pid = occ.rule?.pabrik_id;
      const pabrikName = occ.rule?.pabrik?.nama_pabrik || 'Unknown';
      const subArea = occ.rule?.subArea || 'Umum';
      const areaKey = `${pid}||${subArea}`;

      if (!areaMap[areaKey]) {
        areaMap[areaKey] = {
          area_key: areaKey,
          pabrik_id: pid,
          nama_pabrik: pabrikName,
          sub_area: subArea,
          display_name: `${pabrikName} — ${subArea}`,
          tasks: [],
          summary: { total: 0, dc_done: 0, analysis_done: 0, avp_approved: 0, sap_closed: 0 }
        };
      }

      const s = areaMap[areaKey].summary;
      s.total++;
      if (['ANALYSIS', 'AVP_APPROVAL', 'SAP_UPLOAD', 'CLOSED'].includes(occ.workflowStage)) s.dc_done++;
      if (['AVP_APPROVAL', 'SAP_UPLOAD', 'CLOSED'].includes(occ.workflowStage)) s.analysis_done++;
      if (['SAP_UPLOAD', 'CLOSED'].includes(occ.workflowStage)) s.avp_approved++;
      if (occ.workflowStage === 'CLOSED') s.sap_closed++;

      areaMap[areaKey].tasks.push({
        id: occ.id,
        code: occ.rule?.code,
        subArea: occ.rule?.subArea,
        criticality: occ.rule?.criticality,
        workflowStage: occ.workflowStage,
        status: occ.status,
        scheduledDate: occ.scheduledDate,
        isOverdue: Math.floor((now - new Date(occ.scheduledDate)) / 86400000) > 0 && occ.workflowStage !== 'CLOSED',
        dataCollector: occ.dataCollector,
        analyst: occ.analyst,
        avp: occ.avp
      });
    }

    // Sort: by pabrik_id asc, then subArea asc
    const result = Object.values(areaMap).sort((a, b) => {
      if (a.pabrik_id !== b.pabrik_id) return a.pabrik_id - b.pabrik_id;
      return a.sub_area.localeCompare(b.sub_area);
    });

    res.json({
      userSubArea,
      areas: result
    });
  } catch (err) {
    console.error('getAreaDashboard error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// MY WORKFLOW TASKS — berdasar role, stage, dan area (sub_area)
// ============================================================
export const getMyWorkflowTasks = async (req, res) => {

  try {
    const manpowerId = req.user?.man_power_id;
    const role = req.user?.role;
    const { year, month } = req.query;
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;

    // Ambil sub_area + division dari ManPower user
    let userSubArea = null;
    if (manpowerId) {
      const mp = await prisma.manPower.findUnique({
        where: { id: parseInt(manpowerId) },
        select: { sub_area: true }
      });
      userSubArea = mp?.sub_area || null;
    }

    // ============================================================
    // buildAreaRuleFilter: membangun filter strict Pabrik+Area
    // sub_area format: "P6 PPHS & OSBL" atau "Pabrik 6 PPHS & OSBL"
    // Gunakan EQUALS (bukan contains) agar P6 PPHS & OSBL ≠ P6 Utility & Urea
    // ============================================================
    const buildAreaRuleFilter = (subArea) => {
      if (!subArea) return null;
      const norm = subArea.trim();
      const match = norm.match(/^(?:Pabrik\s+|P)(\d[A-Z]?)\s+(.+)$/i);
      if (match) {
        const pabrikCode = match[1]; // e.g. "6"
        const areaName   = match[2].trim().toUpperCase(); // e.g. "PPHS & OSBL"
        
        // Handling special case for PPHS & OSBL
        if (areaName.includes('PPHS') || areaName.includes('OSBL')) {
          const pphsKeywords = ['ASU', 'ASP', 'CONVEYOR', 'TANKI', 'UBS', 'QAL', 'BSL', 'PPHS', 'OSBL'];
          return {
            rule: {
              pabrik: { nama_pabrik: { contains: pabrikCode, mode: 'insensitive' } },
              OR: pphsKeywords.map(kw => ({ subArea: { contains: kw, mode: 'insensitive' } }))
            }
          };
        }
        
        return {
          rule: {
            pabrik: { nama_pabrik: { contains: pabrikCode, mode: 'insensitive' } },
            subArea: { equals: areaName, mode: 'insensitive' } // exact: PPHS & OSBL ≠ Utility & Urea
          }
        };
      }
      // Fallback: exact match seluruh sub_area string
      return { rule: { subArea: { equals: norm, mode: 'insensitive' } } };
    };

    const areaFilter = buildAreaRuleFilter(userSubArea);

    // ============================================================
    // Bangun where clause berdasarkan role
    // Prinsip:
    // - Analyst    : hanya lihat task stage ANALYSIS di areanya
    //                ATAU task yang dia sudah jadi analystId
    // - DataCollector: hanya lihat task stage DC_COLLECTION di areanya
    //                ATAU task yang dia sudah jadi dataCollectorId
    // - AVP        : hanya lihat task stage AVP_APPROVAL di areanya
    //                ATAU task yang dia sudah jadi avpId
    // - Admin/Manager: lihat semua stage, filter area jika punya sub_area
    // - Staff/lain : hanya task yang di-assign ke dia (semua stage)
    // ============================================================
    const mpId = manpowerId ? parseInt(manpowerId) : null;
    let where = { year: y, month: m, status: { notIn: ['CANCELLED'] } };

    if (!mpId) {
      // Tidak ada manpower context → return empty (jangan tampilkan semua)
      return res.json([]);
    }

    if (role === 'admin' || role === 'manager' || role === 'supervisor') {
      // Admin/manager/supervisor: lihat semua stage
      // Filter area jika mereka punya sub_area assignment
      where = {
        year: y, month: m, status: { notIn: ['CANCELLED'] },
        ...(areaFilter || {})
      };

    } else if (role === 'analyst') {
      // Analyst: HANYA stage ANALYSIS
      // Task yang terlihat:
      // 1. Task yang sudah di-assign ke dia (analystId atau assignedToId)
      // 2. Task di area tanggung jawabnya yang belum ada analyst (team pilih siapa)
      where = {
        year: y, month: m, status: { notIn: ['CANCELLED'] },
        workflowStage: 'ANALYSIS',
        OR: [
          { analystId: mpId },
          { assignedToId: mpId },
          ...(areaFilter ? [areaFilter] : [])
        ]
      };

    } else if (role === 'data_collector') {
      // Data Collector: HANYA stage DC_COLLECTION
      // Task yang terlihat:
      // 1. Task yang sudah di-assign ke dia (dataCollectorId atau assignedToId)
      // 2. Task di area tanggung jawabnya yang belum ada DC (team pilih siapa)
      where = {
        year: y, month: m, status: { notIn: ['CANCELLED'] },
        workflowStage: 'DC_COLLECTION',
        OR: [
          { dataCollectorId: mpId },
          { assignedToId: mpId },
          ...(areaFilter ? [areaFilter] : [])
        ]
      };

    } else if (role?.startsWith('avp')) {
      // AVP: HANYA stage AVP_APPROVAL
      where = {
        year: y, month: m, status: { notIn: ['CANCELLED'] },
        workflowStage: 'AVP_APPROVAL',
        OR: [
          { avpId: mpId },
          { assignedToId: mpId },
          ...(areaFilter ? [areaFilter] : [])
        ]
      };

    } else {
      // Staff/technician/lain: hanya task yang di-assign ke dia (semua stage)
      where = {
        ...where,
        OR: [
          { assignedToId: mpId },
          { dataCollectorId: mpId },
          { analystId: mpId },
          { avpId: mpId }
        ]
      };
    }

    const occurrences = await prisma.pdmScheduleOccurrence.findMany({
      where,
      include: {
        rule: { include: { pabrik: true } },
        assignedTo: { select: { id: true, name: true, npk: true, position: true } },
        dataCollector: { select: { id: true, name: true, npk: true } },
        analyst: { select: { id: true, name: true, npk: true } },
        avp: { select: { id: true, name: true, npk: true } },
        picHistories: {
          include: { fromPic: { select: { id: true, name: true } }, toPic: { select: { id: true, name: true } } },
          orderBy: { changedAt: 'desc' },
          take: 3
        },
        workflowLogs: { orderBy: { createdAt: 'desc' }, take: 5 }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    const result = occurrences.map(occ => ({
      ...occ,
      daysLate: Math.max(0, Math.floor((now - new Date(occ.scheduledDate)) / 86400000)),
      isOverdue: occ.workflowStage !== 'CLOSED' && Math.floor((now - new Date(occ.scheduledDate)) / 86400000) > 0
    }));

    res.json(result);
  } catch (err) {
    console.error('getMyWorkflowTasks error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// WORKFLOW LOG per Occurrence
export const getWorkflowLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await prisma.pdmWorkflowLog.findMany({
      where: { occurrenceId: parseInt(id) },
      include: { actor: { select: { id: true, name: true, npk: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
