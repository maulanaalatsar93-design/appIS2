import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ============================================================
// MAN HOURS — Unified view dari DailyTask + PdmDailyActivity
// ============================================================

/**
 * GET /api/man-hours
 * Query params: startDate, endDate, month, year, pabrik_id, sub_area,
 *               man_power_id, role, kategori, source (daily_task|pdm|all)
 *
 * Mengembalikan data man-hours dari 2 sumber:
 * 1. DailyTask: waktu_mulai, waktu_selesai, man_hours
 * 2. PdmDailyActivity: startTime, endTime, durationMinutes
 */
export const getManHours = async (req, res) => {
  try {
    const { startDate, endDate, month, year, pabrik_id, sub_area,
            man_power_id, role, kategori, source = 'all' } = req.query;

    // RBAC: jika user adalah anggota (non-admin dengan man_power_id), paksa filter ke dirinya sendiri
    const userRole = req.user?.role;
    const userManPowerId = req.user?.man_power_id;
    const isAdmin = ['admin', 'superadmin', 'supervisor', 'manager', 'avp', 'vp'].includes(userRole);
    const effectiveManPowerId = (!isAdmin && userManPowerId)
      ? userManPowerId
      : (man_power_id ? parseInt(man_power_id) : null);

    // Tentukan rentang tanggal
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    let dateFrom = startDate ? new Date(startDate) : new Date(y, m - 1, 1);
    let dateTo = endDate ? new Date(endDate) : new Date(y, m, 0, 23, 59, 59);

    const results = [];

    // ─── Source 1: DailyTask ─────────────────────────────────────────────────
    if (source === 'all' || source === 'daily_task') {
      const dtWhere = {
        tanggal: { gte: dateFrom, lte: dateTo }
      };
      if (pabrik_id) dtWhere.pabrik_id = parseInt(pabrik_id);
      if (sub_area) dtWhere.area = { contains: sub_area, mode: 'insensitive' };
      if (effectiveManPowerId) dtWhere.man_power_id = effectiveManPowerId;
      if (kategori) dtWhere.kategori_program = { contains: kategori, mode: 'insensitive' };
      // filter by role: join via man_power.divisi — skip role filter for DailyTask (tidak ada role di DailyTask)

      const dailyTasks = await prisma.dailyTask.findMany({
        where: dtWhere,
        include: {
          man_power: { select: { id: true, npk: true, name: true, position: true, sub_area: true, divisi: true } },
          pabrik: { select: { id: true, nama_pabrik: true } },
          created_by: { select: { id: true, name: true } }
        },
        orderBy: { tanggal: 'desc' }
      });

      for (const dt of dailyTasks) {
        // Hitung man_hours dari waktu_mulai & waktu_selesai jika man_hours belum ada
        let manHours = dt.man_hours;
        if (!manHours && dt.waktu_mulai && dt.waktu_selesai) {
          const diffMs = new Date(dt.waktu_selesai) - new Date(dt.waktu_mulai);
          manHours = parseFloat((diffMs / 3600000).toFixed(2));
        }

        results.push({
          source: 'DailyTask',
          id: `dt-${dt.id}`,
          tanggal: dt.tanggal,
          man_power_id: dt.man_power_id,
          nama_personel: dt.man_power?.name || null,
          npk: dt.man_power?.npk || null,
          posisi: dt.man_power?.position || null,
          divisi: dt.man_power?.divisi?.nama_divisi || null,
          sub_area: dt.area || dt.man_power?.sub_area || null,
          pabrik: dt.pabrik?.nama_pabrik || null,
          pabrik_id: dt.pabrik_id,
          task_code: dt.code_referensi,
          deskripsi: dt.deskripsi_pekerjaan,
          kategori_program: dt.kategori_program,
          jenis_pekerjaan: dt.kategori_program,
          jam_mulai: dt.waktu_mulai,
          jam_selesai: dt.waktu_selesai,
          man_hours: manHours,
          status: dt.status,
          keterangan: null,
          wo_notif: dt.wo_notif,
          is_self_input: dt.is_self_input
        });
      }
    }

    // ─── Source 2: PdmDailyActivity ─────────────────────────────────────────
    if (source === 'all' || source === 'pdm') {
      const pdmWhere = {
        workDate: { gte: dateFrom, lte: dateTo }
      };
      if (effectiveManPowerId) pdmWhere.performedById = effectiveManPowerId;

      const pdmActivities = await prisma.pdmDailyActivity.findMany({
        where: pdmWhere,
        include: {
          occurrence: {
            include: {
              rule: {
                include: {
                  pabrik: { select: { id: true, nama_pabrik: true } }
                }
              }
            }
          },
          performedBy: {
            select: { id: true, npk: true, name: true, position: true, sub_area: true, divisi: { select: { nama_divisi: true } } }
          }
        },
        orderBy: { workDate: 'desc' }
      });

      for (const act of pdmActivities) {
        // Filter sub_area dari rule.subArea
        const actSubArea = act.occurrence?.rule?.subArea || null;
        if (sub_area && actSubArea && !actSubArea.toLowerCase().includes(sub_area.toLowerCase())) continue;
        if (pabrik_id && act.occurrence?.rule?.pabrik_id !== parseInt(pabrik_id)) continue;

        // Hitung man_hours dari durationMinutes
        const manHours = act.durationMinutes
          ? parseFloat((act.durationMinutes / 60).toFixed(2))
          : null;

        results.push({
          source: 'PdmActivity',
          id: `pdm-${act.id}`,
          tanggal: act.workDate,
          man_power_id: act.performedById,
          nama_personel: act.performedBy?.name || null,
          npk: act.performedBy?.npk || null,
          posisi: act.performedBy?.position || null,
          divisi: act.performedBy?.divisi?.nama_divisi || null,
          sub_area: actSubArea || act.performedBy?.sub_area || null,
          pabrik: act.occurrence?.rule?.pabrik?.nama_pabrik || null,
          pabrik_id: act.occurrence?.rule?.pabrik_id || null,
          task_code: act.occurrence?.rule?.code || null,
          deskripsi: act.activityNote || act.occurrence?.rule?.taskName || null,
          kategori_program: 'PdM Rotating',
          jenis_pekerjaan: act.workflowStage ? `PdM — ${act.workflowStage}` : 'PdM Rotating',
          jam_mulai: act.startTime,
          jam_selesai: act.endTime,
          man_hours: manHours,
          status: act.statusSnapshot,
          keterangan: act.activityNote,
          wo_notif: null,
          is_self_input: false
        });
      }
    }

    // Sort by tanggal desc
    results.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    res.json(results);
  } catch (err) {
    console.error('getManHours error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/man-hours/summary
 * Summary/aggregat man hours: per personel, per area, per pabrik, per role
 * Query params: same as getManHours
 */
export const getManHoursSummary = async (req, res) => {
  try {
    const { month, year, pabrik_id, sub_area } = req.query;
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    const dateFrom = new Date(y, m - 1, 1);
    const dateTo = new Date(y, m, 0, 23, 59, 59);

    // ─── DailyTask aggregat ───────────────────────────────────────────────────
    const dtFilter = { tanggal: { gte: dateFrom, lte: dateTo } };
    if (pabrik_id) dtFilter.pabrik_id = parseInt(pabrik_id);
    if (sub_area) dtFilter.area = { contains: sub_area, mode: 'insensitive' };

    const dailyTasks = await prisma.dailyTask.findMany({
      where: dtFilter,
      include: {
        man_power: { select: { id: true, name: true, npk: true, position: true, sub_area: true, divisi: { select: { nama_divisi: true } } } },
        pabrik: { select: { id: true, nama_pabrik: true } }
      }
    });

    // ─── PdmDailyActivity aggregat ───────────────────────────────────────────
    const pdmActivities = await prisma.pdmDailyActivity.findMany({
      where: { workDate: { gte: dateFrom, lte: dateTo } },
      include: {
        occurrence: { include: { rule: { include: { pabrik: { select: { id: true, nama_pabrik: true } } } } } },
        performedBy: { select: { id: true, name: true, npk: true, position: true, sub_area: true, divisi: { select: { nama_divisi: true } } } }
      }
    });

    // Compute aggregates
    const byPersonel = {};
    const byArea = {};
    const byPabrik = {};
    const byRole = {};
    let totalToday = 0;
    let totalMonth = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    function accumulateEntry(mh, name, npk, area, pabrikName, role, tanggal) {
      if (!mh || mh <= 0) return;

      const t = new Date(tanggal);
      if (t >= today && t <= todayEnd) totalToday += mh;
      totalMonth += mh;

      if (name) {
        const key = npk || name;
        if (!byPersonel[key]) byPersonel[key] = { nama: name, npk, total: 0 };
        byPersonel[key].total += mh;
      }
      if (area) {
        if (!byArea[area]) byArea[area] = { area, total: 0 };
        byArea[area].total += mh;
      }
      if (pabrikName) {
        if (!byPabrik[pabrikName]) byPabrik[pabrikName] = { pabrik: pabrikName, total: 0 };
        byPabrik[pabrikName].total += mh;
      }
      if (role) {
        if (!byRole[role]) byRole[role] = { role, total: 0 };
        byRole[role].total += mh;
      }
    }

    for (const dt of dailyTasks) {
      let mh = dt.man_hours;
      if (!mh && dt.waktu_mulai && dt.waktu_selesai) {
        mh = parseFloat(((new Date(dt.waktu_selesai) - new Date(dt.waktu_mulai)) / 3600000).toFixed(2));
      }
      accumulateEntry(mh, dt.man_power?.name, dt.man_power?.npk,
        dt.area || dt.man_power?.sub_area,
        dt.pabrik?.nama_pabrik,
        dt.man_power?.position,
        dt.tanggal
      );
    }

    for (const act of pdmActivities) {
      const mh = act.durationMinutes ? parseFloat((act.durationMinutes / 60).toFixed(2)) : null;
      accumulateEntry(mh, act.performedBy?.name, act.performedBy?.npk,
        act.occurrence?.rule?.subArea || act.performedBy?.sub_area,
        act.occurrence?.rule?.pabrik?.nama_pabrik,
        act.performedBy?.position,
        act.workDate
      );
    }

    res.json({
      period: { year: y, month: m },
      totals: {
        today: parseFloat(totalToday.toFixed(2)),
        month: parseFloat(totalMonth.toFixed(2))
      },
      by_personel: Object.values(byPersonel).sort((a, b) => b.total - a.total).slice(0, 20),
      by_area: Object.values(byArea).sort((a, b) => b.total - a.total),
      by_pabrik: Object.values(byPabrik).sort((a, b) => b.total - a.total),
      by_role: Object.values(byRole).sort((a, b) => b.total - a.total)
    });
  } catch (err) {
    console.error('getManHoursSummary error:', err);
    res.status(500).json({ error: err.message });
  }
};
