import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '../types/index.js';
import { prisma } from '../config/database.js';
import { changeStatus } from '../services/project.service.js';
import { getAuditLogs } from '../services/audit.service.js';
import { validate } from '../middleware/validate.middleware.js';
import { projectStatusSchema } from '../validators/project.validator.js';

const router = Router();

router.use(authenticate, requireRole(UserRole.ADMIN));

router.get('/dashboard', async (req, res, next) => {
  try {
    const [totalUsers, totalProjects, pendingReviews, activeBids, revenueResult] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.bid.count({ where: { status: 'CONFIRMED' } }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        pendingReviews,
        activeBids,
        totalRevenue: Number(revenueResult._sum.amount || 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, status: true, createdAt: true } });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

router.get('/projects', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({ include: { owner: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
});

router.patch('/projects/:id/status', validate(projectStatusSchema), async (req, res, next) => {
  try {
    const project = await changeStatus(req.params.id as string, req.body.status, req.user!.id);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.get('/bids', async (req, res, next) => {
  try {
    const bids = await prisma.bid.findMany({ include: { project: { select: { name: true } }, bidder: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: bids });
  } catch (error) {
    next(error);
  }
});

router.get('/payments', async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await getAuditLogs(req.query as any);
    res.json({ success: true, ...logs });
  } catch (error) {
    next(error);
  }
});

router.get('/config', async (req, res, next) => {
  try {
    const config = await prisma.bidConfig.findFirst();
    res.json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
});

router.put('/config', async (req, res, next) => {
  try {
    const config = await prisma.bidConfig.findFirst();
    let updated;
    if (config) {
      updated = await prisma.bidConfig.update({ where: { id: config.id }, data: req.body });
    } else {
      updated = await prisma.bidConfig.create({ data: req.body });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
