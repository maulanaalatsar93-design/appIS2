import prisma from '../utils/prisma.js';

// ============================================================
// FIELD TASK CONTROLLER
// ============================================================

/**
 * GET /api/field-tasks
 * Admin: see all. Staff: see assigned to them.
 */
export const getAllTasks = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userManPowerId = req.user?.man_power_id;
    const isAdmin = ['admin', 'superadmin', 'supervisor', 'manager', 'avp', 'vp'].includes(userRole);

    let where = {};
    if (!isAdmin && userManPowerId) {
      where = {
        OR: [
          { pic_id: userManPowerId },
          { members: { some: { man_power_id: userManPowerId } } }
        ]
      };
    }

    const tasks = await prisma.fieldTask.findMany({
      where,
      include: {
        pabrik: { select: { nama_pabrik: true } },
        pic: { select: { name: true, npk: true } },
        members: { include: { man_power: { select: { name: true } } } },
        logs: { select: { man_hours: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/field-tasks/my
 * Specifically for tasks assigned to me
 */
export const getMyTasks = async (req, res) => {
  try {
    const userManPowerId = req.user?.man_power_id;
    if (!userManPowerId) return res.json([]);

    const tasks = await prisma.fieldTask.findMany({
      where: {
        OR: [
          { pic_id: userManPowerId },
          { members: { some: { man_power_id: userManPowerId } } }
        ]
      },
      include: {
        pabrik: { select: { nama_pabrik: true } },
        pic: { select: { name: true, npk: true } },
        members: { include: { man_power: { select: { name: true } } } },
        logs: { select: { man_hours: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/field-tasks/:id
 */
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.fieldTask.findUnique({
      where: { id: parseInt(id) },
      include: {
        pabrik: { select: { nama_pabrik: true } },
        pic: { select: { name: true, npk: true, position: true } },
        members: { include: { man_power: { select: { name: true, npk: true, position: true } } } },
        logs: { 
          include: { man_power: { select: { name: true } } },
          orderBy: { createdAt: 'desc' } 
        }
      }
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/field-tasks
 */
export const createTask = async (req, res) => {
  try {
    const { judul, deskripsi, pabrik_id, area, equipment, wo_notif, kategori, prioritas, pic_id, deadline } = req.body;
    const userId = req.user?.id;
    
    if (!judul) return res.status(400).json({ error: 'Judul wajib diisi' });

    const newTask = await prisma.fieldTask.create({
      data: {
        judul,
        deskripsi,
        pabrik_id: pabrik_id ? parseInt(pabrik_id) : null,
        area,
        equipment,
        wo_notif,
        kategori: kategori || 'Corrective',
        prioritas: prioritas || 'Normal',
        pic_id: pic_id ? parseInt(pic_id) : (req.user?.man_power_id || null),
        created_by_id: userId,
        deadline: deadline ? new Date(deadline) : null
      }
    });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/field-tasks/:id
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.pabrik_id) updateData.pabrik_id = parseInt(updateData.pabrik_id);
    if (updateData.pic_id) updateData.pic_id = parseInt(updateData.pic_id);
    if (updateData.deadline) updateData.deadline = new Date(updateData.deadline);

    const task = await prisma.fieldTask.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/field-tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.fieldTask.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/field-tasks/:id/log
 * Creates a FieldTaskLog and optionally a DailyTask (man hours)
 */
export const addTaskLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan, status_update, waktu_mulai, waktu_selesai, foto } = req.body;
    const userManPowerId = req.user?.man_power_id;

    if (!userManPowerId) return res.status(403).json({ error: 'Anda tidak memiliki ManPower ID' });
    if (!catatan) return res.status(400).json({ error: 'Catatan wajib diisi' });

    const fieldTask = await prisma.fieldTask.findUnique({ where: { id: parseInt(id) } });
    if (!fieldTask) return res.status(404).json({ error: 'Task not found' });

    // Calculate man hours if times are provided
    let man_hours = null;
    if (waktu_mulai && waktu_selesai) {
      const diff = new Date(waktu_selesai) - new Date(waktu_mulai);
      if (diff > 0) man_hours = parseFloat((diff / 3600000).toFixed(2));
    }

    let daily_task_id = null;

    // Create DailyTask (Man Hours) if we have man hours
    if (man_hours !== null && man_hours > 0) {
      const dailyTask = await prisma.dailyTask.create({
        data: {
          tanggal: new Date(),
          man_power_id: userManPowerId,
          pabrik_id: fieldTask.pabrik_id,
          area: fieldTask.area,
          equipment: fieldTask.equipment,
          kategori_program: fieldTask.kategori,
          deskripsi_pekerjaan: `[${fieldTask.judul}] ${catatan}`,
          waktu_mulai: new Date(waktu_mulai),
          waktu_selesai: new Date(waktu_selesai),
          man_hours: man_hours,
          wo_notif: fieldTask.wo_notif,
          status: 'Done',
          is_self_input: true
        }
      });
      daily_task_id = dailyTask.id;
    }

    // Create FieldTaskLog
    const newLog = await prisma.fieldTaskLog.create({
      data: {
        field_task_id: fieldTask.id,
        man_power_id: userManPowerId,
        catatan,
        status_update,
        waktu_mulai: waktu_mulai ? new Date(waktu_mulai) : null,
        waktu_selesai: waktu_selesai ? new Date(waktu_selesai) : null,
        man_hours,
        daily_task_id,
        foto
      },
      include: {
        man_power: { select: { name: true } }
      }
    });

    // Update FieldTask status if status_update is provided
    if (status_update && status_update !== fieldTask.status) {
      await prisma.fieldTask.update({
        where: { id: fieldTask.id },
        data: { status: status_update }
      });
    }

    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/field-tasks/:id/members
 */
export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { man_power_id, role } = req.body;

    if (!man_power_id) return res.status(400).json({ error: 'man_power_id required' });

    const member = await prisma.fieldTaskMember.create({
      data: {
        field_task_id: parseInt(id),
        man_power_id: parseInt(man_power_id),
        role: role || 'MEMBER'
      },
      include: { man_power: { select: { name: true, npk: true } } }
    });
    res.status(201).json(member);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Personel sudah ada dalam tim' });
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/field-tasks/:id/members/:mpId
 */
export const removeMember = async (req, res) => {
  try {
    const { id, mpId } = req.params;
    
    // Find the member record first to get its ID
    const memberRecord = await prisma.fieldTaskMember.findFirst({
      where: {
        field_task_id: parseInt(id),
        man_power_id: parseInt(mpId)
      }
    });

    if (!memberRecord) return res.status(404).json({ error: 'Member not found' });

    await prisma.fieldTaskMember.delete({ where: { id: memberRecord.id } });
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/field-tasks/:id/pic
 */
export const updatePic = async (req, res) => {
  try {
    const { id } = req.params;
    const { pic_id } = req.body;
    
    const task = await prisma.fieldTask.update({
      where: { id: parseInt(id) },
      data: { pic_id: parseInt(pic_id) }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
