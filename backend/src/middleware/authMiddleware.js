import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_istek2_key_fallback';

import prisma from '../utils/prisma.js';
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, etc. }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export const protect = authenticate;
export const authenticateToken = authenticate;

export const authorize = (...allowedRoles) => {
  const roles = allowedRoles.flat().map(r => typeof r === 'string' ? r.toLowerCase() : '');
  return (req, res, next) => {
    if (!req.user || !roles.includes((req.user.role || '').toLowerCase())) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
