import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_istek2_key_fallback';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Fetch user from DB to guarantee man_power_id is always present (robust against old tokens)
    const userDb = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, man_power_id: true, npk: true, name: true }
    });
    
    if (!userDb) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    
    req.user = userDb; 
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export const protect = authenticate;
export const authenticateToken = authenticate;

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
