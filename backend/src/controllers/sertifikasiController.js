import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all sertifikasi
export const getAllSertifikasi = async (req, res) => {
  try {
    const sertifikasiList = await prisma.sertifikasi.findMany({
      include: {
        man_power: {
          select: {
            name: true,
            npk: true,
            divisi: {
              select: {
                nama_divisi: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(sertifikasiList);
  } catch (error) {
    console.error('Error in getAllSertifikasi:', error);
    res.status(500).json({ message: 'Gagal mengambil data sertifikasi', error: error.message });
  }
};

// Create a new sertifikasi
export const createSertifikasi = async (req, res) => {
  try {
    const { man_power_id, nama_sertifikat, no_sertifikat, tanggal_sertifikasi, tanggal_berakhir, remarks, is_rencana } = req.body;
    
    // Validation
    if (!man_power_id || !nama_sertifikat) {
      return res.status(400).json({ message: 'ID Personel dan Nama Sertifikat harus diisi' });
    }

    const isVPOrAdmin = req.user && ['admin', 'vp'].includes(req.user.role);
    const status = isVPOrAdmin ? 'Approved' : 'Pending New';

    const newSertifikasi = await prisma.sertifikasi.create({
      data: {
        man_power_id: parseInt(man_power_id),
        nama_sertifikat,
        no_sertifikat,
        tanggal_sertifikasi: tanggal_sertifikasi ? new Date(tanggal_sertifikasi) : null,
        tanggal_berakhir: tanggal_berakhir ? new Date(tanggal_berakhir) : null,
        remarks,
        is_rencana: Boolean(is_rencana),
        status,
        proposed_by_id: req.user?.id || null
      }
    });

    res.status(201).json(newSertifikasi);
  } catch (error) {
    console.error('Error in createSertifikasi:', error);
    res.status(500).json({ message: 'Gagal menambahkan data sertifikasi', error: error.message });
  }
};

// Update an existing sertifikasi
export const updateSertifikasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { man_power_id, nama_sertifikat, no_sertifikat, tanggal_sertifikasi, tanggal_berakhir, remarks, is_rencana } = req.body;

    const isVPOrAdmin = req.user && ['admin', 'vp'].includes(req.user.role);

    let updatedSertifikasi;

    if (isVPOrAdmin) {
      updatedSertifikasi = await prisma.sertifikasi.update({
        where: { id: parseInt(id) },
        data: {
          ...(man_power_id && { man_power_id: parseInt(man_power_id) }),
          ...(nama_sertifikat && { nama_sertifikat }),
          ...(no_sertifikat !== undefined && { no_sertifikat }),
          ...(tanggal_sertifikasi !== undefined && { tanggal_sertifikasi: tanggal_sertifikasi ? new Date(tanggal_sertifikasi) : null }),
          ...(tanggal_berakhir !== undefined && { tanggal_berakhir: tanggal_berakhir ? new Date(tanggal_berakhir) : null }),
          ...(remarks !== undefined && { remarks }),
          ...(is_rencana !== undefined && { is_rencana: Boolean(is_rencana) }),
          status: 'Approved',
          pending_changes: null,
          proposed_by_id: null
        }
      });
    } else {
      const pendingChanges = {
        man_power_id: man_power_id ? parseInt(man_power_id) : undefined,
        nama_sertifikat: nama_sertifikat,
        no_sertifikat: no_sertifikat,
        tanggal_sertifikasi: tanggal_sertifikasi,
        tanggal_berakhir: tanggal_berakhir,
        remarks: remarks,
        is_rencana: is_rencana
      };

      // Filter out undefined values
      Object.keys(pendingChanges).forEach(key => pendingChanges[key] === undefined && delete pendingChanges[key]);

      updatedSertifikasi = await prisma.sertifikasi.update({
        where: { id: parseInt(id) },
        data: {
          status: 'Pending Update',
          pending_changes: pendingChanges,
          proposed_by_id: req.user?.id || null
        }
      });
    }

    res.json(updatedSertifikasi);
  } catch (error) {
    console.error('Error in updateSertifikasi:', error);
    res.status(500).json({ message: 'Gagal memperbarui data sertifikasi', error: error.message });
  }
};

// Delete a sertifikasi
export const deleteSertifikasi = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.sertifikasi.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Data sertifikasi berhasil dihapus' });
  } catch (error) {
    console.error('Error in deleteSertifikasi:', error);
    res.status(500).json({ message: 'Gagal menghapus data sertifikasi', error: error.message });
  }
};

// Ignore expired sertifikasi
export const ignoreExpiredSertifikasi = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedSertifikasi = await prisma.sertifikasi.update({
      where: { id: parseInt(id) },
      data: {
        is_ignored_expired: true
      }
    });

    res.json(updatedSertifikasi);
  } catch (error) {
    console.error('Error in ignoreExpiredSertifikasi:', error);
    res.status(500).json({ message: 'Gagal mengabaikan peringatan sertifikasi', error: error.message });
  }
};

// Approve sertifikasi changes
export const approveSertifikasi = async (req, res) => {
  try {
    const { id } = req.params;
    const sertifikasi = await prisma.sertifikasi.findUnique({ where: { id: parseInt(id) } });

    if (!sertifikasi) {
      return res.status(404).json({ message: 'Data sertifikasi tidak ditemukan' });
    }

    let updateData = {
      status: 'Approved',
      pending_changes: null,
      proposed_by_id: null
    };

    if (sertifikasi.status === 'Pending Update' && sertifikasi.pending_changes) {
      const pc = sertifikasi.pending_changes;
      updateData = {
        ...updateData,
        ...(pc.man_power_id && { man_power_id: parseInt(pc.man_power_id) }),
        ...(pc.nama_sertifikat && { nama_sertifikat: pc.nama_sertifikat }),
        ...(pc.no_sertifikat !== undefined && { no_sertifikat: pc.no_sertifikat }),
        ...(pc.tanggal_sertifikasi !== undefined && { tanggal_sertifikasi: pc.tanggal_sertifikasi ? new Date(pc.tanggal_sertifikasi) : null }),
        ...(pc.tanggal_berakhir !== undefined && { tanggal_berakhir: pc.tanggal_berakhir ? new Date(pc.tanggal_berakhir) : null }),
        ...(pc.remarks !== undefined && { remarks: pc.remarks }),
        ...(pc.is_rencana !== undefined && { is_rencana: Boolean(pc.is_rencana) })
      };
    }

    const updated = await prisma.sertifikasi.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ message: 'Sertifikasi berhasil di-approve', data: updated });
  } catch (error) {
    console.error('Error in approveSertifikasi:', error);
    res.status(500).json({ message: 'Gagal melakukan approve', error: error.message });
  }
};

// Reject sertifikasi changes
export const rejectSertifikasi = async (req, res) => {
  try {
    const { id } = req.params;
    const sertifikasi = await prisma.sertifikasi.findUnique({ where: { id: parseInt(id) } });

    if (!sertifikasi) {
      return res.status(404).json({ message: 'Data sertifikasi tidak ditemukan' });
    }

    if (sertifikasi.status === 'Pending New') {
      await prisma.sertifikasi.delete({ where: { id: parseInt(id) } });
      return res.json({ message: 'Pengajuan sertifikasi baru ditolak (dihapus)' });
    } else {
      const updated = await prisma.sertifikasi.update({
        where: { id: parseInt(id) },
        data: {
          status: 'Approved',
          pending_changes: null,
          proposed_by_id: null
        }
      });
      return res.json({ message: 'Perubahan sertifikasi ditolak', data: updated });
    }
  } catch (error) {
    console.error('Error in rejectSertifikasi:', error);
    res.status(500).json({ message: 'Gagal melakukan reject', error: error.message });
  }
};
