import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all Performance Killers
export const getPerformanceKillers = async (req, res) => {
  try {
    const pk = await prisma.performanceKiller.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(pk);
  } catch (error) {
    console.error('Error fetching Performance Killers:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};

// Create a new Performance Killer
export const createPerformanceKiller = async (req, res) => {
  try {
    const { item, area_plant, masalah, tindak_lanjut } = req.body;
    const pk = await prisma.performanceKiller.create({
      data: {
        item,
        area_plant,
        masalah,
        tindak_lanjut,
      },
    });
    res.status(201).json(pk);
  } catch (error) {
    console.error('Error creating Performance Killer:', error);
    res.status(500).json({ error: 'Failed to create data' });
  }
};

// Update a Performance Killer
export const updatePerformanceKiller = async (req, res) => {
  try {
    const { id } = req.params;
    const { item, area_plant, masalah, tindak_lanjut } = req.body;
    const pk = await prisma.performanceKiller.update({
      where: { id: parseInt(id) },
      data: {
        item,
        area_plant,
        masalah,
        tindak_lanjut,
      },
    });
    res.json(pk);
  } catch (error) {
    console.error('Error updating Performance Killer:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
};

// Delete a Performance Killer
export const deletePerformanceKiller = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.performanceKiller.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Performance Killer deleted successfully' });
  } catch (error) {
    console.error('Error deleting Performance Killer:', error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
};
