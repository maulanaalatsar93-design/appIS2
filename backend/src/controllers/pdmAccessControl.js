import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ============================================================
// HELPER: Ambil konteks area user dari ManPower
// ============================================================

/**
 * Ambil sub_area user + role dari DB.
 * Returns: { manpowerId, userSubArea, userRole, isAdmin }
 */
export const getUserAreaContext = async (req) => {
  let manpowerId = req.user?.man_power_id ? parseInt(req.user.man_power_id) : null;
  
  // Fallback for old tokens that didn't include man_power_id
  if (!manpowerId && req.user?.id) {
    const userDb = await prisma.user.findUnique({
      where: { id: parseInt(req.user.id) },
      select: { man_power_id: true }
    });
    manpowerId = userDb?.man_power_id ? parseInt(userDb.man_power_id) : null;
  }

  const userRole = req.user?.role || 'staff';
  const isAdmin = ['admin', 'superadmin', 'supervisor'].includes(userRole);

  let userSubArea = null;
  if (manpowerId) {
    const mp = await prisma.manPower.findUnique({
      where: { id: manpowerId },
      select: { sub_area: true }
    });
    userSubArea = mp?.sub_area || null;
  }

  return { manpowerId, userSubArea, userRole, isAdmin };
}

/**
 * Cek apakah user punya delegasi aktif untuk occurrence ini.
 * Returns: true/false
 */
export async function hasCrossDelegation(manpowerId, occurrenceId) {
  if (!manpowerId || !occurrenceId) return false;
  const now = new Date();
  const delegation = await prisma.pdmCrossDelegation.findFirst({
    where: {
      occurrenceId,
      delegatedToId: manpowerId,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } }
      ]
    }
  });
  return !!delegation;
}

/**
 * Cek apakah user berhak mengakses task occurrence (Read Access).
 * Lulus jika: (1) admin, (2) area sama, (3) punya delegasi aktif.
 */
export async function canReadOccurrence(manpowerId, userSubArea, isAdmin, occurrence) {
  if (isAdmin) return true;
  if (!occurrence) return false;

  const taskSubArea = occurrence.rule?.subArea;

  // Jika user tidak punya sub_area → bisa lihat semua (fallback safe)
  if (!userSubArea) return true;

  // Jika area cocok
  let isSubAreaMatch = false;
  if (taskSubArea && userSubArea) {
    const match = userSubArea.match(/^(?:Pabrik\s+|P)(\d[A-Z]?)\s+(.+)$/i);
    if (match) {
      isSubAreaMatch = taskSubArea.toLowerCase().includes(match[2].trim().toLowerCase());
    } else {
      isSubAreaMatch = taskSubArea.toLowerCase() === userSubArea.toLowerCase();
    }
  }
  if (isSubAreaMatch) return true;

  // Cek delegasi cross-area
  if (manpowerId) {
    return await hasCrossDelegation(manpowerId, occurrence.id);
  }

  return false;
}

/**
 * Cek apakah user berhak menulis (ubah status) occurrence.
 * Lulus jika: (1) admin, (2) adalah PIC (DC/Analyst/AVP/assignedTo).
 */
export async function canWriteOccurrence(manpowerId, isAdmin, occurrence, requiredStageRole = null) {
  if (isAdmin) return true;
  if (!manpowerId || !occurrence) return false;

  const mpId = parseInt(manpowerId);

  // Cek role spesifik yang diperlukan
  if (requiredStageRole === 'DC') return occurrence.dataCollectorId === mpId || occurrence.assignedToId === mpId;
  if (requiredStageRole === 'ANALYST') return occurrence.analystId === mpId;
  if (requiredStageRole === 'AVP') return occurrence.avpId === mpId;

  // Fallback: salah satu dari PIC manapun
  return (
    occurrence.dataCollectorId === mpId ||
    occurrence.analystId === mpId ||
    occurrence.avpId === mpId ||
    occurrence.assignedToId === mpId
  );
}

// ============================================================
// CRUD DELEGASI CROSS-AREA
// ============================================================

/**
 * POST /api/pdm-schedule/:id/delegate
 * Body: { delegatedToId, role, reason, expiresAt? }
 * Hanya Analyst & AVP yang bisa (role: analyst, avp_*, admin, supervisor)
 */
export const createDelegation = async (req, res) => {
  try {
    const { id } = req.params;
    const { delegatedToId, role = 'DC', reason, expiresAt } = req.body;
    const { manpowerId, userRole, isAdmin } = await getUserAreaContext(req);

    // Hanya analyst, AVP role, admin/supervisor yang bisa membuat delegasi
    const canDelegate = isAdmin || ['analyst', 'avp', 'avp_rotating1', 'avp_rotating2', 'avp_pphs'].some(r => userRole?.toLowerCase().includes(r));
    if (!canDelegate) {
      return res.status(403).json({ error: 'Hanya Analyst, AVP, atau Admin yang dapat membuat delegasi' });
    }

    if (!delegatedToId) {
      return res.status(400).json({ error: 'delegatedToId wajib diisi' });
    }

    const occId = parseInt(id);
    const occ = await prisma.pdmScheduleOccurrence.findUnique({ where: { id: occId } });
    if (!occ) return res.status(404).json({ error: 'Task tidak ditemukan' });
    if (['CLOSED', 'CANCELLED'].includes(occ.workflowStage || occ.status)) {
      return res.status(400).json({ error: 'Task sudah selesai/dibatalkan' });
    }

    // Nonaktifkan delegasi sebelumnya untuk personel yang sama pada task ini
    await prisma.pdmCrossDelegation.updateMany({
      where: { occurrenceId: occId, delegatedToId: parseInt(delegatedToId), isActive: true },
      data: { isActive: false }
    });

    const delegation = await prisma.pdmCrossDelegation.create({
      data: {
        occurrenceId: occId,
        delegatedById: manpowerId,
        delegatedToId: parseInt(delegatedToId),
        role,
        reason: reason || null,
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        delegatedBy: { select: { id: true, name: true } },
        delegatedTo: { select: { id: true, name: true, sub_area: true } }
      }
    });

    res.status(201).json(delegation);
  } catch (err) {
    console.error('createDelegation error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/pdm-schedule/:id/delegations
 * Daftar delegasi aktif untuk task ini
 */
export const getDelegations = async (req, res) => {
  try {
    const { id } = req.params;
    const delegations = await prisma.pdmCrossDelegation.findMany({
      where: { occurrenceId: parseInt(id) },
      include: {
        delegatedBy: { select: { id: true, name: true, position: true } },
        delegatedTo: { select: { id: true, name: true, sub_area: true, position: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(delegations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/pdm-schedule/:id/delegate/:delegationId
 * Cabut delegasi (hanya pemberi atau admin)
 */
export const revokeDelegation = async (req, res) => {
  try {
    const { delegationId } = req.params;
    const { manpowerId, isAdmin } = await getUserAreaContext(req);

    const delegation = await prisma.pdmCrossDelegation.findUnique({ where: { id: parseInt(delegationId) } });
    if (!delegation) return res.status(404).json({ error: 'Delegasi tidak ditemukan' });

    if (!isAdmin && delegation.delegatedById !== manpowerId) {
      return res.status(403).json({ error: 'Hanya pemberi delegasi atau Admin yang dapat mencabut delegasi' });
    }

    await prisma.pdmCrossDelegation.update({
      where: { id: parseInt(delegationId) },
      data: { isActive: false }
    });
    res.json({ message: 'Delegasi berhasil dicabut' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// ADMIN UTILITY: Update sub_area ManPower
// ============================================================

/**
 * PUT /api/pdm-schedule/admin/manpower/:mpId/sub-area
 * Body: { sub_area }
 * Hanya admin
 */
export const updateManpowerSubArea = async (req, res) => {
  try {
    const { mpId } = req.params;
    const { sub_area } = req.body;
    const { isAdmin } = await getUserAreaContext(req);

    if (!isAdmin) return res.status(403).json({ error: 'Hanya Admin yang dapat mengubah sub_area personel' });

    const updated = await prisma.manPower.update({
      where: { id: parseInt(mpId) },
      data: { sub_area: sub_area || null },
      select: { id: true, npk: true, name: true, position: true, sub_area: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/pdm-schedule/admin/manpower/areas
 * Daftar semua personel dengan sub_area mereka (untuk admin UI)
 */
export const getManpowerAreas = async (req, res) => {
  try {
    const { isAdmin } = await getUserAreaContext(req);
    if (!isAdmin) return res.status(403).json({ error: 'Hanya Admin' });

    const list = await prisma.manPower.findMany({
      where: { is_active: true },
      select: {
        id: true, npk: true, name: true, position: true, sub_area: true,
        divisi: { select: { id: true, nama_divisi: true } }
      },
      orderBy: [{ sub_area: 'asc' }, { name: 'asc' }]
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
