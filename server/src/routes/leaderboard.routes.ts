import { Router } from 'express';
import { getLeaderboard, getTodayStats, getCategoryOverview } from '../services/ranking.service.js';

const router = Router();

router.get('/categories/overview', async (_req, res, next) => {
  try {
    const categories = await getCategoryOverview();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, category } = req.query;
    const leaderboard = await getLeaderboard({
      category: category as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });
    res.json({ success: true, ...leaderboard });
  } catch (error) {
    next(error);
  }
});

router.get('/today-stats', async (_req, res, next) => {
  try {
    const stats = await getTodayStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

router.get('/category/:category', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const leaderboard = await getLeaderboard({
      category: req.params.category,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });
    res.json({ success: true, ...leaderboard });
  } catch (error) {
    next(error);
  }
});

export default router;
