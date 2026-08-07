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

    const newSertifikasi = await prisma.sertifikasi.create({
      data: {
        man_power_id: parseInt(man_power_id),
        nama_sertifikat,
        no_sertifikat,
        tanggal_sertifikasi: tanggal_sertifikasi ? new Date(tanggal_sertifikasi) : null,
        tanggal_berakhir: tanggal_berakhir ? new Date(tanggal_berakhir) : null,
        remarks,
        is_rencana: Boolean(is_rencana)
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

    const updatedSertifikasi = await prisma.sertifikasi.update({
      where: { id: parseInt(id) },
      data: {
        ...(man_power_id && { man_power_id: parseInt(man_power_id) }),
        ...(nama_sertifikat && { nama_sertifikat }),
        ...(no_sertifikat !== undefined && { no_sertifikat }),
        ...(tanggal_sertifikasi !== undefined && { tanggal_sertifikasi: tanggal_sertifikasi ? new Date(tanggal_sertifikasi) : null }),
        ...(tanggal_berakhir !== undefined && { tanggal_berakhir: tanggal_berakhir ? new Date(tanggal_berakhir) : null }),
        ...(remarks !== undefined && { remarks }),
        ...(is_rencana !== undefined && { is_rencana: Boolean(is_rencana) })
      }
    });

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
