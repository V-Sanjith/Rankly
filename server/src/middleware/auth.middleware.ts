import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service.js';
import { prisma } from '../config/database.js';
import { UnauthorizedError, ForbiddenError } from './error.middleware.js';
import { UserRole } from '../types/index.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);

    if (!payload.userId) {
      throw new UnauthorizedError('Invalid token payload');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('Account is suspended or inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.role !== role) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = await verifyToken(token).catch(() => null);

      if (payload?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId as string }
        });
        if (user && user.status === 'ACTIVE') {
          req.user = user;
        }
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
  } finally {
    next();
  }
};
