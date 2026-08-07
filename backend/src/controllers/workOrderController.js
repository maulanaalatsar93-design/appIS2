import prisma from '../utils/prisma.js';

// Get list of Work Orders with filtering, searching, and pagination
export const getWorkOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, pabrik_id, status, tipe_pm } = req.query;

    let whereClause = {};

    if (search) {
      whereClause.OR = [
        { nomor_wo: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (pabrik_id) {
      whereClause.pabrik_id = parseInt(pabrik_id);
    }

    if (status) {
      whereClause.status = status;
    }

    if (tipe_pm) {
      whereClause.tipe_pm = tipe_pm;
    }

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
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
      prisma.workOrder.count({
        where: whereClause
      })
    ]);

    res.json({
      data: workOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching work orders:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil data Work Order' });
  }
};

// Get single Work Order detail
export const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        pabrik: true
      }
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Work Order tidak ditemukan' });
    }

    res.json(workOrder);
  } catch (error) {
    console.error('Error fetching work order detail:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil detail Work Order' });
  }
};
