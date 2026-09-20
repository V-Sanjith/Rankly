import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    // Perform a real database query probe
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database Health Check Failed:', error.message || error);
    return res.status(503).json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
