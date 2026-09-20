import { Router } from 'express';
import { recordView, recordClick, getProjectAnalytics, getDashboardOverview } from '../services/analytics.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { prisma } from '../config/database.js';

const router = Router();

router.post('/view', async (req, res, next) => {
  try {
    const { projectId, sessionId, referrer } = req.body;
    await recordView(projectId, sessionId, referrer, req.ip, req.headers['user-agent']);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/click', async (req, res, next) => {
  try {
    const { projectId, sessionId } = req.body;
    await recordClick(projectId, sessionId, req.ip);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/project/:id', authenticate, async (req, res, next) => {
  try {
    const data = await getProjectAnalytics(req.params.id as string);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const data = await getDashboardOverview(req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/activity', authenticate, async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

export default router;
