import prisma from '../utils/prisma.js';
// ============================================================
// DAILY TASK — CRUD untuk input man hours harian
// ============================================================

/**
 * GET /api/daily-tasks
 * Query: month, year, pabrik_id, man_power_id, area, kategori
 */
export const getDailyTasks = async (req, res) => {
  try {
    const { month, year, pabrik_id, man_power_id, area, kategori, startDate, endDate } = req.query;
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;

    const dateFrom = startDate ? new Date(startDate) : new Date(y, m - 1, 1);
    const dateTo   = endDate   ? new Date(endDate)   : new Date(y, m, 0, 23, 59, 59);

    // RBAC: anggota (non-admin yang punya man_power_id) hanya bisa lihat task miliknya
    const userRole = req.user?.role;
    const userManPowerId = req.user?.man_power_id;
    const isAdmin = ['admin', 'superadmin', 'supervisor', 'manager', 'avp', 'vp'].includes(userRole);

    const where = { tanggal: { gte: dateFrom, lte: dateTo } };
    if (pabrik_id) where.pabrik_id = parseInt(pabrik_id);
    if (area) where.area = { contains: area, mode: 'insensitive' };
    if (kategori) where.kategori_program = { contains: kategori, mode: 'insensitive' };

    // Jika admin: boleh filter by man_power_id query param; jika anggota: paksa filter ke dirinya
    if (!isAdmin && userManPowerId) {
      where.man_power_id = userManPowerId;
    } else if (man_power_id) {
      where.man_power_id = parseInt(man_power_id);
    }

    const tasks = await prisma.dailyTask.findMany({
      where,
      include: {
        man_power: { select: { id: true, name: true, npk: true, position: true, sub_area: true, divisi: { select: { nama_divisi: true } } } },
        pabrik: { select: { id: true, nama_pabrik: true } },
        created_by: { select: { id: true, name: true } }
      },
      orderBy: [{ tanggal: 'desc' }, { createdAt: 'desc' }]
    });

    // Hitung man_hours otomatis jika belum tersimpan
    const result = tasks.map(t => {
      let mh = t.man_hours;
      if (!mh && t.waktu_mulai && t.waktu_selesai) {
        mh = parseFloat(((new Date(t.waktu_selesai) - new Date(t.waktu_mulai)) / 3600000).toFixed(2));
      }
      return { ...t, man_hours: mh };
    });

    res.json(result);
  } catch (err) {
    console.error('getDailyTasks error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/daily-tasks
 * Body: { tanggal, man_power_id, pabrik_id, area, kategori_program, deskripsi_pekerjaan,
 *         waktu_mulai?, waktu_selesai?, wo_notif?, code_referensi?, equipment? }
 */
export const createDailyTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      tanggal, man_power_id, pabrik_id, area, kategori_program,
      deskripsi_pekerjaan, waktu_mulai, waktu_selesai, wo_notif,
      code_referensi, equipment, is_self_input
    } = req.body;

    if (!tanggal || !kategori_program || !deskripsi_pekerjaan) {
      return res.status(400).json({ error: 'Field wajib: tanggal, kategori_program, deskripsi_pekerjaan' });
    }

    // Hitung man_hours dari waktu_mulai & waktu_selesai jika keduanya ada
    let man_hours = null;
    if (waktu_mulai && waktu_selesai) {
      const diff = new Date(waktu_selesai) - new Date(waktu_mulai);
      if (diff > 0) man_hours = parseFloat((diff / 3600000).toFixed(2));
    }

    const task = await prisma.dailyTask.create({
      data: {
        tanggal: new Date(tanggal),
        man_power_id: man_power_id ? parseInt(man_power_id) : null,
        pabrik_id: pabrik_id ? parseInt(pabrik_id) : null,
        area: area || null,
        kategori_program,
        deskripsi_pekerjaan,
        waktu_mulai: waktu_mulai ? new Date(waktu_mulai) : null,
        waktu_selesai: waktu_selesai ? new Date(waktu_selesai) : null,
        man_hours,
        wo_notif: wo_notif || null,
        code_referensi: code_referensi || null,
        equipment: equipment || null,
        is_self_input: is_self_input ?? (req.user?.man_power_id ? true : false),
        created_by_id: userId || null,
        status: 'Unassigned'
      },
      include: {
        man_power: { select: { id: true, name: true, npk: true } },
        pabrik: { select: { id: true, nama_pabrik: true } }
      }
    });
    res.status(201).json(task);
  } catch (err) {
    console.error('createDailyTask error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/daily-tasks/:id
 */
export const updateDailyTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;
    const isAdmin = ['admin', 'superadmin', 'supervisor'].includes(role);

    const existing = await prisma.dailyTask.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'DailyTask tidak ditemukan' });

    // Boleh edit jika:
    // 1. Admin/supervisor, ATAU
    // 2. Pembuat task (created_by_id), ATAU
    // 3. Personil yang ditugaskan (man_power_id === user.man_power_id dari token)
    const userManPowerId = req.user?.man_power_id;
    const isAssignedPersonil = userManPowerId && existing.man_power_id === userManPowerId;

    if (!isAdmin && existing.created_by_id !== userId && !isAssignedPersonil) {
      return res.status(403).json({ error: 'Hanya pembuat task, personil yang ditugaskan, atau Admin yang dapat mengedit' });
    }

    // Jika anggota yang ditugaskan (bukan pembuat): hanya bisa edit waktu kerja actual
    if (!isAdmin && isAssignedPersonil && existing.created_by_id !== userId) {
      // Anggota yang bukan pembuat: hanya bisa edit waktu kerja actual
      const { waktu_mulai, waktu_selesai } = req.body;
      let man_hours = existing.man_hours;
      const newMulai  = waktu_mulai  ? new Date(waktu_mulai)  : existing.waktu_mulai;
      const newSelesai = waktu_selesai ? new Date(waktu_selesai) : existing.waktu_selesai;
      if (newMulai && newSelesai) {
        const diff = new Date(newSelesai) - new Date(newMulai);
        if (diff > 0) man_hours = parseFloat((diff / 3600000).toFixed(2));
      }
      const updated = await prisma.dailyTask.update({
        where: { id: parseInt(id) },
        data: {
          waktu_mulai: waktu_mulai !== undefined ? (waktu_mulai ? new Date(waktu_mulai) : null) : existing.waktu_mulai,
          waktu_selesai: waktu_selesai !== undefined ? (waktu_selesai ? new Date(waktu_selesai) : null) : existing.waktu_selesai,
          man_hours,
        },
        include: {
          man_power: { select: { id: true, name: true, npk: true } },
          pabrik: { select: { id: true, nama_pabrik: true } }
        }
      });
      return res.json(updated);
    }

    const { tanggal, man_power_id, pabrik_id, area, kategori_program,
      deskripsi_pekerjaan, waktu_mulai, waktu_selesai, wo_notif,
      code_referensi, equipment, status } = req.body;

    let man_hours = existing.man_hours;
    const newMulai  = waktu_mulai  ? new Date(waktu_mulai)  : existing.waktu_mulai;
    const newSelesai = waktu_selesai ? new Date(waktu_selesai) : existing.waktu_selesai;
    if (newMulai && newSelesai) {
      const diff = new Date(newSelesai) - new Date(newMulai);
      if (diff > 0) man_hours = parseFloat((diff / 3600000).toFixed(2));
    }

    const updated = await prisma.dailyTask.update({
      where: { id: parseInt(id) },
      data: {
        tanggal: tanggal ? new Date(tanggal) : existing.tanggal,
        man_power_id: man_power_id !== undefined ? (man_power_id ? parseInt(man_power_id) : null) : existing.man_power_id,
        pabrik_id: pabrik_id !== undefined ? (pabrik_id ? parseInt(pabrik_id) : null) : existing.pabrik_id,
        area: area !== undefined ? area : existing.area,
        kategori_program: kategori_program || existing.kategori_program,
        deskripsi_pekerjaan: deskripsi_pekerjaan || existing.deskripsi_pekerjaan,
        waktu_mulai: waktu_mulai !== undefined ? (waktu_mulai ? new Date(waktu_mulai) : null) : existing.waktu_mulai,
        waktu_selesai: waktu_selesai !== undefined ? (waktu_selesai ? new Date(waktu_selesai) : null) : existing.waktu_selesai,
        man_hours,
        wo_notif: wo_notif !== undefined ? wo_notif : existing.wo_notif,
        code_referensi: code_referensi !== undefined ? code_referensi : existing.code_referensi,
        equipment: equipment !== undefined ? equipment : existing.equipment,
        status: status || existing.status
      },
      include: {
        man_power: { select: { id: true, name: true, npk: true } },
        pabrik: { select: { id: true, nama_pabrik: true } }
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('updateDailyTask error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/daily-tasks/:id — hanya Admin
 */
export const deleteDailyTask = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user?.role;
    const isAdmin = ['admin', 'superadmin', 'supervisor'].includes(role);
    if (!isAdmin) return res.status(403).json({ error: 'Hanya Admin yang dapat menghapus data' });

    await prisma.dailyTask.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'DailyTask berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
