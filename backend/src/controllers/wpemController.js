import prisma from '../utils/prisma.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ─────────────────────────────────────────────
// DATA: HARI LIBUR NASIONAL INDONESIA 2025 & 2026
// ─────────────────────────────────────────────
const INDONESIA_HOLIDAYS = {
  '2025-01-01': 'Tahun Baru 2025',
  '2025-01-27': 'Isra Mikraj Nabi Muhammad SAW',
  '2025-01-29': 'Tahun Baru Imlek 2576',
  '2025-03-29': 'Hari Raya Nyepi',
  '2025-03-31': 'Idul Fitri 1446 H (Hari 1)',
  '2025-04-01': 'Idul Fitri 1446 H (Hari 2)',
  '2025-04-18': 'Wafat Isa Almasih',
  '2025-04-20': 'Hari Paskah',
  '2025-05-01': 'Hari Buruh Internasional',
  '2025-05-12': 'Hari Raya Waisak 2569',
  '2025-05-29': 'Kenaikan Isa Almasih',
  '2025-06-01': 'Hari Lahir Pancasila',
  '2025-06-06': 'Idul Adha 1446 H',
  '2025-06-27': 'Tahun Baru Islam 1447 H',
  '2025-08-17': 'Hari Kemerdekaan RI',
  '2025-09-05': 'Maulid Nabi Muhammad SAW',
  '2025-12-25': 'Hari Raya Natal',
  '2025-12-26': 'Cuti Bersama Natal',
  '2026-01-01': 'Tahun Baru 2026',
  '2026-01-16': 'Isra Mikraj Nabi Muhammad SAW',
  '2026-02-17': 'Tahun Baru Imlek 2577',
  '2026-03-19': 'Hari Raya Nyepi',
  '2026-03-20': 'Idul Fitri 1447 H (Hari 1)',
  '2026-03-21': 'Idul Fitri 1447 H (Hari 2)',
  '2026-04-03': 'Wafat Isa Almasih',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Isa Almasih',
  '2026-05-31': 'Hari Raya Waisak 2570',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-06-26': 'Idul Adha 1447 H',
  '2026-07-17': 'Tahun Baru Islam 1448 H',
  '2026-08-17': 'Hari Kemerdekaan RI',
  '2026-09-25': 'Maulid Nabi Muhammad SAW',
  '2026-12-25': 'Hari Raya Natal',
};

// ─────────────────────────────────────────────
// AVAILABILITY BOARD
// ─────────────────────────────────────────────
export const getAvailability = async (req, res) => {
  try {
    const { startDate, endDate, division_id, division_ids, status } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Format start date as local YYYY-MM-DD to accurately check weekends/holidays in Indonesia timezone
    const offset = 7 * 60 * 60 * 1000; // WIB offset
    const localStart = new Date(start.getTime() + offset);
    const startStr = localStart.toISOString().split('T')[0];
    const isWeekend = localStart.getUTCDay() === 0 || localStart.getUTCDay() === 6; // Sunday or Saturday
    const isHoliday = !!INDONESIA_HOLIDAYS[startStr];
    const isOffday = isWeekend || isHoliday;

    const where = { is_active: true };
    const divFilter = division_ids || division_id;
    if (divFilter && divFilter !== 'All') {
      const ids = (Array.isArray(divFilter) ? divFilter.join(',') : String(divFilter))
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
      if (ids.length > 0) {
        where.division_id = { in: ids };
      }
    }

    const manpowerList = await prisma.manPower.findMany({
      where,
      include: {
        divisi: true,
        absensi: {
          where: {
            AND: [
              { tanggal_mulai: { lte: end } },
              { tanggal_selesai: { gte: start } }
            ]
          }
        },
        wp_memberships: {
          where: {
            program: {
              status: { in: ['Approved', 'Team Ready', 'Active'] },
              AND: [
                { start_date: { lte: end } },
                { end_date: { gte: start } }
              ]
            }
          },
          include: {
            program: {
              select: { id: true, title: true, status: true, start_date: true, end_date: true }
            }
          }
        }
      },
      orderBy: [{ division_id: 'asc' }, { position: 'asc' }, { name: 'asc' }]
    });

    const enriched = manpowerList.map(mp => {
      const hasAbsensi = mp.absensi.length > 0;
      const isBusy = mp.wp_memberships.length > 0;
      const absensiJenis = hasAbsensi ? (mp.absensi[0].jenis || '').toLowerCase().trim() : null;
      const nextAvailable = hasAbsensi
        ? mp.absensi.reduce((max, a) => a.tanggal_selesai > max ? a.tanggal_selesai : max, mp.absensi[0].tanggal_selesai)
        : null;

      let statusColor = 'Tersedia'; // default

      if (!mp.is_active) {
        statusColor = 'Inactive';
      } else if (absensiJenis === 'cuti') {
        // Cuti sabtu/minggu/libur nasional = Offday / Libur
        statusColor = isOffday ? 'Libur' : 'Cuti';
      } else if (absensiJenis === 'sakit') {
        statusColor = 'Sakit';
      } else if (absensiJenis === 'izin') {
        statusColor = 'Izin';
      } else if (absensiJenis === 'training') {
        statusColor = 'Training';
      } else if (absensiJenis === 'dinas dalam negeri' || absensiJenis === 'dinas luar negeri' || absensiJenis === 'dinasdalamnegeri' || absensiJenis === 'dinasluarnegeri') {
        statusColor = 'Dinas';
      } else if (absensiJenis === 'referral') {
        statusColor = 'Referral';
      } else if (absensiJenis === 'alpha/tanpa keterangan' || absensiJenis === 'alpha' || absensiJenis === 'alpa') {
        statusColor = 'Alpha';
      } else if (absensiJenis === 'libur') {
        statusColor = 'Libur';
      } else if (isBusy) {
        statusColor = 'Bertugas';
      } else if (isOffday) {
        statusColor = 'Libur'; // Default jika weekend/libur dan tidak ada status absen lain
      }

      return {
        id: mp.id,
        npk: mp.npk,
        name: mp.name,
        position: mp.position,
        employee_type: mp.employee_type,
        divisi: mp.divisi,
        availability_status: statusColor,
        absensi: mp.absensi,
        next_available: nextAvailable,
        active_programs: mp.wp_memberships.map(m => m.program),
        is_active: mp.is_active
      };
    });

    // Filter by status if provided
    const filtered = status && status !== 'All'
      ? enriched.filter(mp => mp.availability_status === status)
      : enriched;

    res.json(filtered);
  } catch (error) {
    console.error('Error in getAvailability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// GET APPROVERS (AVP + VP from ManPower)
// ─────────────────────────────────────────────
export const getWPEMApprovers = async (req, res) => {
  try {
    const approvers = await prisma.manPower.findMany({
      where: {
        is_active: true,
        OR: [
          { position: { startsWith: 'AVP', mode: 'insensitive' } },
          { position: { contains: 'Vice President', mode: 'insensitive' } }
        ]
      },
      include: { divisi: true },
      orderBy: [{ division_id: 'asc' }, { position: 'asc' }]
    });

    const categorized = approvers.map(a => ({
      id: a.id,
      npk: a.npk,
      name: a.name,
      position: a.position,
      level: a.position.toLowerCase().includes('vice president') ? 'VP' : 'AVP',
      divisi: a.divisi
    }));

    res.json(categorized);
  } catch (error) {
    console.error('Error in getWPEMApprovers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// PROGRAM LIST
// ─────────────────────────────────────────────
export const getPrograms = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== 'All') where.status = status;

    const programs = await prisma.workProgram.findMany({
      where,
      include: {
        created_by: { select: { id: true, name: true } },
        coordinator: { select: { id: true, name: true, position: true } },
        members: {
          include: { man_power: { select: { id: true, name: true, position: true } } }
        },
        approvals: {
          include: { approver: { select: { id: true, name: true, position: true } } },
          orderBy: { order_seq: 'asc' }
        },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(programs);
  } catch (error) {
    console.error('Error in getPrograms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// PROGRAM DETAIL
// ─────────────────────────────────────────────
export const getProgramById = async (req, res) => {
  try {
    const program = await prisma.workProgram.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        created_by: { select: { id: true, name: true } },
        coordinator: { select: { id: true, name: true, position: true, divisi: true } },
        members: {
          include: {
            man_power: {
              include: { divisi: true }
            }
          }
        },
        approvals: {
          include: { approver: { select: { id: true, name: true, position: true } } },
          orderBy: { order_seq: 'asc' }
        },
        audits: {
          include: { actor: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' }
        },
        items: {
          include: {
            pic: { select: { id: true, name: true, position: true } },
            _count: { select: { checklists: true, activities: true } }
          },
          orderBy: { item_no: 'asc' }
        }
      }
    });

    if (!program) return res.status(404).json({ error: 'Program not found' });
    res.json(program);
  } catch (error) {
    console.error('Error in getProgramById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// CREATE PROGRAM
// ─────────────────────────────────────────────
export const createProgram = async (req, res) => {
  try {
    const {
      title, plant, area, work_package, department,
      start_date, end_date, estimated_duration,
      coordinator_id, members, approvers, notes,
      is_urgent_bypass, bypass_reason
    } = req.body;

    const userId = req.user?.id;

    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'title, start_date, end_date are required' });
    }
    if (is_urgent_bypass && !bypass_reason) {
      return res.status(400).json({ error: 'bypass_reason is required for urgent bypass' });
    }

    const program = await prisma.$transaction(async (tx) => {
      // 1. Create Program
      const newProgram = await tx.workProgram.create({
        data: {
          title, plant, area, work_package, department, notes,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          estimated_duration: estimated_duration ? parseInt(estimated_duration) : null,
          is_urgent_bypass: !!is_urgent_bypass,
          bypass_reason: bypass_reason || null,
          status: 'Draft',
          created_by_id: userId,
          coordinator_id: coordinator_id ? parseInt(coordinator_id) : null
        }
      });

      // 2. Create Members
      if (members && members.length > 0) {
        await tx.workProgramMember.createMany({
          data: members.map(m => ({
            program_id: newProgram.id,
            man_power_id: parseInt(m.man_power_id),
            role: m.role || 'Member'
          }))
        });
      }

      // 3. Create Approvers from ManPower
      if (approvers && approvers.length > 0) {
        await tx.workProgramApproval.createMany({
          data: approvers.map((a, idx) => ({
            program_id: newProgram.id,
            approver_mp_id: parseInt(a.man_power_id),
            level: a.level || 'AVP',
            status: 'Pending',
            order_seq: a.level === 'VP' ? 10 : idx
          }))
        });
      }

      // 4. If urgent bypass, auto-add VP approver only
      if (is_urgent_bypass) {
        const vp = await tx.manPower.findFirst({
          where: { position: { contains: 'Vice President', mode: 'insensitive' }, is_active: true }
        });
        if (vp) {
          await tx.workProgramApproval.create({
            data: {
              program_id: newProgram.id,
              approver_mp_id: vp.id,
              level: 'VP',
              status: 'Pending',
              order_seq: 10
            }
          });
        }
      }

      // 5. Audit trail
      await tx.workProgramAudit.create({
        data: {
          program_id: newProgram.id,
          actor_id: userId,
          action: 'Created',
          details: `Program "${title}" dibuat`
        }
      });

      return newProgram;
    });

    res.status(201).json(program);
  } catch (error) {
    console.error('Error in createProgram:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// SUBMIT PROGRAM FOR APPROVAL
// ─────────────────────────────────────────────
export const submitProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const program = await prisma.workProgram.findUnique({
      where: { id: parseInt(id) },
      include: { approvals: true }
    });

    if (!program) return res.status(404).json({ error: 'Program not found' });
    if (program.status !== 'Draft' && program.status !== 'Revision Requested') {
      return res.status(400).json({ error: 'Program can only be submitted from Draft or Revision Requested status' });
    }

    const hasAvpApprovers = program.approvals.some(a => a.level === 'AVP');
    const hasVpApprovers = program.approvals.some(a => a.level === 'VP');

    let newStatus = 'Waiting AVP Approval';
    if (program.is_urgent_bypass || (!hasAvpApprovers && hasVpApprovers)) {
      newStatus = 'Waiting VP Approval';
    }

    await prisma.$transaction([
      prisma.workProgram.update({
        where: { id: parseInt(id) },
        data: { status: newStatus }
      }),
      prisma.workProgramAudit.create({
        data: {
          program_id: parseInt(id),
          actor_id: userId,
          action: program.is_urgent_bypass ? 'Bypassed' : 'Submitted',
          details: program.is_urgent_bypass
            ? `Bypass ke VP. Alasan: ${program.bypass_reason}`
            : `Diajukan untuk persetujuan AVP`
        }
      })
    ]);

    res.json({ message: 'Program submitted', status: newStatus });
  } catch (error) {
    console.error('Error in submitProgram:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// PROCESS APPROVAL (AVP or VP)
// ─────────────────────────────────────────────
export const processApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approver_mp_id, decision, notes } = req.body;
    const userId = req.user?.id;

    if (!decision) return res.status(400).json({ error: 'decision is required' });

    const program = await prisma.workProgram.findUnique({
      where: { id: parseInt(id) },
      include: { approvals: true }
    });

    if (!program) return res.status(404).json({ error: 'Program not found' });

    const approval = program.approvals.find(
      a => a.approver_mp_id === parseInt(approver_mp_id) && a.status === 'Pending'
    );

    if (!approval) return res.status(403).json({ error: 'No pending approval found for this approver' });

    let newProgramStatus = program.status;

    if (decision === 'Rejected') {
      newProgramStatus = 'Rejected';
    } else if (decision === 'Revision') {
      newProgramStatus = 'Revision Requested';
    } else if (decision === 'Approved') {
      if (approval.level === 'AVP') {
        // Check if all other AVPs also approved
        const otherPendingAvps = program.approvals.filter(
          a => a.level === 'AVP' && a.id !== approval.id && a.status === 'Pending'
        );
        if (otherPendingAvps.length === 0) {
          // All AVPs done → move to VP
          newProgramStatus = 'Waiting VP Approval';
        }
      } else if (approval.level === 'VP') {
        newProgramStatus = 'Approved';
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.workProgramApproval.update({
        where: { id: approval.id },
        data: { status: decision, notes: notes || null, action_date: new Date() }
      });

      await tx.workProgram.update({
        where: { id: parseInt(id) },
        data: { status: newProgramStatus }
      });

      // If Approved and VP level → form team
      if (decision === 'Approved' && approval.level === 'VP') {
        await tx.workProgramAudit.create({
          data: {
            program_id: parseInt(id),
            actor_id: userId,
            action: 'TeamFormed',
            details: 'Tim terbentuk otomatis setelah persetujuan VP'
          }
        });

        await tx.workProgram.update({
          where: { id: parseInt(id) },
          data: { status: 'Team Ready' }
        });
      }

      await tx.workProgramAudit.create({
        data: {
          program_id: parseInt(id),
          actor_id: userId,
          action: decision,
          details: notes || `Keputusan: ${decision}`
        }
      });
    });

    res.json({ message: 'Approval processed', newStatus: newProgramStatus });
  } catch (error) {
    console.error('Error in processApproval:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// VP / SUPERADMIN OVERRIDE APPROVAL
// Digunakan saat VP/superadmin tidak terdaftar di WorkProgramApproval
// tapi tetap ingin approve/reject/revision program
// ─────────────────────────────────────────────
export const vpOverrideApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!decision) return res.status(400).json({ error: 'decision is required' });

    const allowedRoles = ['vp', 'superadmin', 'VP', 'SuperAdmin', 'super_admin'];
    if (!allowedRoles.some(r => userRole?.toLowerCase() === r.toLowerCase())) {
      return res.status(403).json({ error: 'Hanya VP atau Super Admin yang dapat menggunakan override approval.' });
    }

    const program = await prisma.workProgram.findUnique({
      where: { id: parseInt(id) },
      include: { approvals: true }
    });

    if (!program) return res.status(404).json({ error: 'Program not found' });

    const allowedStatuses = ['Waiting VP Approval', 'Waiting AVP Approval'];
    if (!allowedStatuses.includes(program.status)) {
      return res.status(400).json({ error: `Override hanya tersedia saat status Waiting AVP/VP Approval. Status saat ini: ${program.status}` });
    }

    let newProgramStatus;
    if (decision === 'Rejected') {
      newProgramStatus = 'Rejected';
    } else if (decision === 'Revision') {
      newProgramStatus = 'Revision Requested';
    } else if (decision === 'Approved') {
      newProgramStatus = 'Team Ready';
    } else {
      return res.status(400).json({ error: 'decision harus Approved, Revision, atau Rejected' });
    }

    await prisma.$transaction(async (tx) => {
      // Mark all pending approvals as skipped/approved by override
      await tx.workProgramApproval.updateMany({
        where: { program_id: parseInt(id), status: 'Pending' },
        data: { status: 'Approved', notes: `Override oleh ${userRole}`, action_date: new Date() }
      });

      await tx.workProgram.update({
        where: { id: parseInt(id) },
        data: { status: newProgramStatus }
      });

      await tx.workProgramAudit.create({
        data: {
          program_id: parseInt(id),
          actor_id: userId,
          action: decision === 'Approved' ? 'ApprovedByVP' : decision,
          details: notes || `Override ${decision} oleh ${userRole}`
        }
      });

      if (decision === 'Approved') {
        await tx.workProgramAudit.create({
          data: {
            program_id: parseInt(id),
            actor_id: userId,
            action: 'TeamFormed',
            details: 'Tim terbentuk setelah persetujuan VP/SuperAdmin'
          }
        });
      }
    });

    res.json({ message: 'VP override approval processed', newStatus: newProgramStatus });
  } catch (error) {
    console.error('Error in vpOverrideApproval:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const addProgramFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const userId = req.user?.id;

    if (!feedback) return res.status(400).json({ error: 'Feedback text is required' });

    const program = await prisma.workProgram.findUnique({ where: { id: parseInt(id) } });
    if (!program) return res.status(404).json({ error: 'Program not found' });

    await prisma.workProgramAudit.create({
      data: {
        program_id: parseInt(id),
        actor_id: userId,
        action: 'Feedback',
        details: feedback
      }
    });

    res.json({ message: 'Feedback added successfully' });
  } catch (error) {
    console.error('Error in addProgramFeedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProgramPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    const userId = req.user?.id;

    const validPriorities = ['Low', 'Normal', 'High', 'Urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const program = await prisma.workProgram.update({
      where: { id: parseInt(id) },
      data: { priority }
    });

    await prisma.workProgramAudit.create({
      data: {
        program_id: parseInt(id),
        actor_id: userId,
        action: 'PriorityUpdate',
        details: `Prioritas diubah menjadi: ${priority}`
      }
    });

    res.json(program);
  } catch (error) {
    console.error('Error in updateProgramPriority:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// WORK ITEMS
// ─────────────────────────────────────────────
export const getItems = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await prisma.workItem.findMany({
      where: { program_id: parseInt(id) },
      include: {
        pic: { select: { id: true, name: true, position: true } },
        _count: { select: { checklists: true, activities: true } }
      },
      orderBy: { item_no: 'asc' }
    });
    res.json(items);
  } catch (error) {
    console.error('Error in getItems:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_no, title, equipment, description, pic_id, helpers, estimated_duration, priority } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required' });

    const item = await prisma.workItem.create({
      data: {
        program_id: parseInt(id),
        item_no: item_no || null,
        title,
        equipment: equipment || null,
        description: description || null,
        pic_id: pic_id ? parseInt(pic_id) : null,
        helpers: helpers || null,
        estimated_duration: estimated_duration ? parseInt(estimated_duration) : null,
        priority: priority || 'Normal',
        status: 'Waiting'
      },
      include: { pic: { select: { id: true, name: true, position: true } } }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error in createItem:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { item_no, title, equipment, description, pic_id, helpers, estimated_duration, priority } = req.body;

    const item = await prisma.workItem.update({
      where: { id: parseInt(itemId) },
      data: {
        item_no: item_no || null,
        title,
        equipment: equipment || null,
        description: description || null,
        pic_id: pic_id ? parseInt(pic_id) : null,
        helpers: helpers || null,
        estimated_duration: estimated_duration ? parseInt(estimated_duration) : null,
        priority: priority || 'Normal',
      },
      include: { pic: { select: { id: true, name: true, position: true } } }
    });

    res.json(item);
  } catch (error) {
    console.error('Error in updateItem:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateItemStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    const validStatuses = ['Waiting', 'In Progress', 'Ready For Review', 'Done', 'Hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status };
    if (status === 'In Progress') updateData.started_at = new Date();
    if (status === 'Done') updateData.completed_at = new Date();

    const item = await prisma.workItem.update({
      where: { id: parseInt(itemId) },
      data: updateData
    });

    // Auto-log activity
    await prisma.workItemActivity.create({
      data: {
        item_id: parseInt(itemId),
        actor_id: userId,
        description: `Status berubah menjadi: ${status}`
      }
    });

    res.json(item);
  } catch (error) {
    console.error('Error in updateItemStatus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// ITEM DETAIL + ACTIVITIES + CHECKLISTS
// ─────────────────────────────────────────────
export const getItemDetail = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await prisma.workItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        program: { select: { id: true, title: true, status: true } },
        pic: { select: { id: true, name: true, position: true } },
        activities: {
          include: { actor: { select: { id: true, name: true } } },
          orderBy: { logged_at: 'asc' }
        },
        checklists: {
          include: { pic: { select: { id: true, name: true } } },
          orderBy: { order_seq: 'asc' }
        },
        reviews: {
          include: { reviewer: { select: { id: true, name: true } } },
          orderBy: { reviewed_at: 'desc' }
        }
      }
    });

    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    console.error('Error in getItemDetail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addActivity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { description, attachments } = req.body;
    const userId = req.user?.id;

    if (!description) return res.status(400).json({ error: 'description is required' });

    const activity = await prisma.workItemActivity.create({
      data: {
        item_id: parseInt(itemId),
        actor_id: userId,
        description,
        attachments: attachments || null
      },
      include: { actor: { select: { id: true, name: true } } }
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error in addActivity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// CHECKLIST
// ─────────────────────────────────────────────
export const getChecklists = async (req, res) => {
  try {
    const { itemId } = req.params;
    const checklists = await prisma.workItemChecklist.findMany({
      where: { item_id: parseInt(itemId) },
      include: { pic: { select: { id: true, name: true } } },
      orderBy: { order_seq: 'asc' }
    });
    res.json(checklists);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createChecklist = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { title, pic_mp_id, notes, order_seq } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required' });

    const checklist = await prisma.workItemChecklist.create({
      data: {
        item_id: parseInt(itemId),
        title,
        pic_mp_id: pic_mp_id ? parseInt(pic_mp_id) : null,
        notes: notes || null,
        order_seq: order_seq ? parseInt(order_seq) : 0
      }
    });

    res.status(201).json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateChecklist = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Belum', 'Proses', 'Selesai', 'Tidak Berlaku'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status, notes };
    if (status === 'Selesai') updateData.completed_at = new Date();

    const updated = await prisma.workItemChecklist.update({
      where: { id: parseInt(checklistId) },
      data: updateData
    });

    // Recalculate progress on the parent WorkItem
    const allChecklists = await prisma.workItemChecklist.findMany({
      where: { item_id: updated.item_id }
    });
    const done = allChecklists.filter(c => c.status === 'Selesai' || c.status === 'Tidak Berlaku').length;
    const total = allChecklists.length;
    const progress_pct = total > 0 ? Math.round((done / total) * 100) : 0;

    await prisma.workItem.update({
      where: { id: updated.item_id },
      data: { progress_pct }
    });

    res.json({ ...updated, progress_pct });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// COORDINATOR REVIEW
// ─────────────────────────────────────────────
export const reviewItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { decision, notes } = req.body;
    const userId = req.user?.id;

    if (!decision || !['Approved', 'Revision'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be Approved or Revision' });
    }

    const newItemStatus = decision === 'Approved' ? 'Done' : 'In Progress';

    await prisma.$transaction([
      prisma.workItemReview.create({
        data: {
          item_id: parseInt(itemId),
          reviewer_id: userId,
          decision,
          notes: notes || null
        }
      }),
      prisma.workItem.update({
        where: { id: parseInt(itemId) },
        data: {
          status: newItemStatus,
          completed_at: decision === 'Approved' ? new Date() : null
        }
      }),
      prisma.workItemActivity.create({
        data: {
          item_id: parseInt(itemId),
          actor_id: userId,
          description: decision === 'Approved'
            ? 'Koordinator menyetujui — Item selesai (Done)'
            : `Koordinator meminta revisi: ${notes || '-'}`
        }
      })
    ]);

    res.json({ message: `Review processed: ${decision}`, newStatus: newItemStatus });
  } catch (error) {
    console.error('Error in reviewItem:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// MY WORK CUBE (items assigned to current user)
// ─────────────────────────────────────────────
export const getMyWorkCube = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Find the ManPower linked to this User
    const userWithMp = await prisma.user.findUnique({
      where: { id: userId },
      include: { man_power: true }
    });

    if (!userWithMp?.man_power) {
      return res.json([]); // No linked manpower
    }

    const mpId = userWithMp.man_power.id;

    // Items where this person is PIC
    const asPic = await prisma.workItem.findMany({
      where: {
        pic_id: mpId,
        status: { not: 'Done' },
        program: { status: { in: ['Team Ready', 'Active', 'Approved'] } }
      },
      include: {
        program: { select: { id: true, title: true, plant: true } },
        _count: { select: { checklists: true, activities: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Items where this person is in helpers JSON
    // We'll get all active items and filter in JS since helpers is JSON
    const allItems = await prisma.workItem.findMany({
      where: {
        helpers: { not: null },
        status: { not: 'Done' },
        program: { status: { in: ['Team Ready', 'Active', 'Approved'] } }
      },
      include: {
        program: { select: { id: true, title: true, plant: true } },
        _count: { select: { checklists: true, activities: true } }
      }
    });

    const asHelper = allItems.filter(item => {
      try {
        const helpers = Array.isArray(item.helpers) ? item.helpers : JSON.parse(item.helpers);
        return helpers.includes(mpId);
      } catch { return false; }
    });

    // Merge and deduplicate
    const picIds = new Set(asPic.map(i => i.id));
    const combined = [...asPic, ...asHelper.filter(i => !picIds.has(i.id))];

    res.json(combined);
  } catch (error) {
    console.error('Error in getMyWorkCube:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// KPI DASHBOARD
// ─────────────────────────────────────────────
export const getKPI = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.toDateString());

    const [
      totalPrograms, waitingApproval, activePrograms, completedPrograms,
      totalItems, inProgressItems, doneItems, overdueItems,
      totalManpower, busyManpower
    ] = await Promise.all([
      prisma.workProgram.count(),
      prisma.workProgram.count({ where: { status: { in: ['Waiting AVP Approval', 'Waiting VP Approval'] } } }),
      prisma.workProgram.count({ where: { status: { in: ['Team Ready', 'Active'] } } }),
      prisma.workProgram.count({ where: { status: 'Completed' } }),
      prisma.workItem.count(),
      prisma.workItem.count({ where: { status: 'In Progress' } }),
      prisma.workItem.count({ where: { status: 'Done' } }),
      prisma.workItem.count({ where: { status: { not: 'Done' }, program: { end_date: { lt: today } } } }),
      prisma.manPower.count({ where: { is_active: true } }),
      prisma.workProgramMember.count({
        where: {
          program: { status: { in: ['Team Ready', 'Active'] } }
        }
      })
    ]);

    // Recent activities
    const recentActivities = await prisma.workItemActivity.findMany({
      take: 10,
      orderBy: { logged_at: 'desc' },
      include: {
        actor: { select: { id: true, name: true } },
        item: {
          select: {
            id: true, title: true, item_no: true,
            program: { select: { id: true, title: true } }
          }
        }
      }
    });

    // Programs progress
    const programs = await prisma.workProgram.findMany({
      where: { status: { in: ['Team Ready', 'Active', 'Approved'] } },
      include: {
        _count: { select: { items: true } },
        items: { select: { status: true, progress_pct: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const programsWithProgress = programs.map(p => {
      const total = p.items.length;
      const done = p.items.filter(i => i.status === 'Done').length;
      const avgProgress = total > 0 ? Math.round(p.items.reduce((sum, i) => sum + i.progress_pct, 0) / total) : 0;
      return {
        id: p.id,
        title: p.title,
        status: p.status,
        total_items: total,
        done_items: done,
        progress_pct: avgProgress
      };
    });

    res.json({
      summary: {
        totalPrograms,
        waitingApproval,
        activePrograms,
        completedPrograms,
        totalItems,
        inProgressItems,
        doneItems,
        overdueItems,
        totalManpower,
        busyManpower,
        availableManpower: totalManpower - Math.min(busyManpower, totalManpower),
        utilization_pct: totalManpower > 0 ? Math.round((busyManpower / totalManpower) * 100) : 0
      },
      programsProgress: programsWithProgress,
      recentActivities
    });
  } catch (error) {
    console.error('Error in getKPI:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
