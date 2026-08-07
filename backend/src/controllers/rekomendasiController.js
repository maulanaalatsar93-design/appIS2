import prisma from '../utils/prisma.js';

// Get list of Rekomendasi with filtering, searching, and pagination
export const getRekomendasi = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, pabrik_id, notification_type } = req.query;

    let whereClause = {};

    if (search) {
      whereClause.OR = [
        { notification: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (pabrik_id) {
      whereClause.pabrik_id = parseInt(pabrik_id);
    }

    if (notification_type) {
      whereClause.notification_type = notification_type;
    }

    const [rekomendasiList, total] = await Promise.all([
      prisma.rekomendasi.findMany({
        where: whereClause,
        include: {
          pabrik: true
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.rekomendasi.count({
        where: whereClause
      })
    ]);

    res.json({
      data: rekomendasiList,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching rekomendasi:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil data Rekomendasi' });
  }
};

// Get single Rekomendasi detail
export const getRekomendasiById = async (req, res) => {
  try {
    const { id } = req.params;
    const rekomendasi = await prisma.rekomendasi.findUnique({
      where: { id: parseInt(id) },
      include: {
        pabrik: true
      }
    });

    if (!rekomendasi) {
      return res.status(404).json({ error: 'Rekomendasi tidak ditemukan' });
    }

    res.json(rekomendasi);
  } catch (error) {
    console.error('Error fetching rekomendasi detail:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil detail Rekomendasi' });
  }
};
