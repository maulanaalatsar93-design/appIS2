import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/kehadiran
export const getKehadiran = async (req, res) => {
  try {
    const records = await prisma.statusKehadiran.findMany({
      include: {
        man_power: {
          select: { id: true, name: true, npk: true, position: true }
        }
      },
      orderBy: { tanggal_mulai: 'desc' }
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching kehadiran:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// POST /api/kehadiran
export const createKehadiran = async (req, res) => {
  try {
    const { employee_id, start_date, end_date, jenis, note } = req.body;

    if (!employee_id || !start_date || !end_date || !jenis) {
      return res.status(400).json({ message: 'Lengkapi semua field wajib.' });
    }

    // Set proper UTC boundaries for start and end dates based on input date strings
    const startObj = new Date(start_date);
    const endObj = new Date(end_date);
    
    // Asumsikan start_date dan end_date formatnya "YYYY-MM-DD"
    // Konversi ke UTC midnight (00:00:00) dan end of day (23:59:59)
    const tanggal_mulai = new Date(Date.UTC(startObj.getFullYear(), startObj.getMonth(), startObj.getDate(), 0, 0, 0, 0));
    const tanggal_selesai = new Date(Date.UTC(endObj.getFullYear(), endObj.getMonth(), endObj.getDate(), 23, 59, 59, 999));

    const newRecord = await prisma.statusKehadiran.create({
      data: {
        man_power_id: parseInt(employee_id),
        tanggal_mulai,
        tanggal_selesai,
        jenis,
        keterangan: note || null
      },
      include: {
        man_power: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Error creating kehadiran:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// DELETE /api/kehadiran/:id
export const deleteKehadiran = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.statusKehadiran.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Kehadiran berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting kehadiran:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
