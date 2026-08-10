import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_istek2_key_fallback';

export const login = async (req, res) => {
  try {
    const { npk, password } = req.body;

    if (!npk || !password) {
      return res.status(400).json({ message: 'NPK and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { npk },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid NPK or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid NPK or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, npk: user.npk, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '3h' }
    );

    // Update is_online status
    await prisma.user.update({
      where: { id: user.id },
      data: { is_online: true, last_active: new Date() }
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        npk: user.npk,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Password lama salah' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error changing password' });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        npk: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { is_online: false }
      });
    }
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error during logout' });
  }
};

export const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await prisma.user.findMany({
      where: { is_online: true },
      select: {
        id: true,
        name: true,
        role: true,
        last_active: true,
        man_power: {
          select: {
            position: true,
            divisi: { select: { nama_divisi: true } }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(onlineUsers);
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Internal server error fetching online users' });
  }
};
