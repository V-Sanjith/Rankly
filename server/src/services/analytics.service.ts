import { prisma } from '../config/database.js';

export const recordView = async (projectId: string, sessionId?: string, referrer?: string, ipAddress?: string, userAgent?: string) => {
  // Deduplicate within 30 min
  if (sessionId || ipAddress) {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentView = await prisma.analyticsEvent.findFirst({
      where: {
        projectId,
        eventType: 'VIEW',
        createdAt: { gte: thirtyMinsAgo },
        OR: [
          ...(sessionId ? [{ sessionId }] : []),
          ...(ipAddress ? [{ ipAddress }] : [])
        ]
      }
    });

    if (recentView) return recentView; // Already recorded
  }

  return prisma.analyticsEvent.create({
    data: {
      projectId,
      eventType: 'VIEW',
      sessionId,
      referrer,
      ipAddress,
      userAgent
    }
  });
};

export const recordClick = async (projectId: string, sessionId?: string, ipAddress?: string) => {
  return prisma.analyticsEvent.create({
    data: {
      projectId,
      eventType: 'CLICK',
      sessionId,
      ipAddress
    }
  });
};

export const getProjectAnalytics = async (projectId: string, timeRangeDays: number = 30) => {
  const fromDate = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000);

  const [views, clicks] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { projectId, eventType: 'VIEW', createdAt: { gte: fromDate } }
    }),
    prisma.analyticsEvent.count({
      where: { projectId, eventType: 'CLICK', createdAt: { gte: fromDate } }
    })
  ]);

  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : 0;

  return { views, clicks, ctr };
};

export const getDashboardOverview = async (userId: string) => {
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    select: { id: true, status: true }
  });

  const projectIds = projects.map((p: { id: string }) => p.id);

  const [totalBids, analyticsEvents] = await Promise.all([
    prisma.bid.count({
      where: { projectId: { in: projectIds }, status: 'CONFIRMED' }
    }),
    prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: { projectId: { in: projectIds } },
      _count: true
    })
  ]);

  const views = analyticsEvents.find((e: { eventType: string; _count: number }) => e.eventType === 'VIEW')?._count || 0;
  const clicks = analyticsEvents.find((e: { eventType: string; _count: number }) => e.eventType === 'CLICK')?._count || 0;

  return {
    totalProjects: projects.length,
    activeProjects: projects.filter((p: { status: string }) => p.status === 'APPROVED').length,
    totalBids,
    totalViews: views,
    totalClicks: clicks
  };
};
