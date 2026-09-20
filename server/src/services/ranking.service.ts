import { prisma } from '../config/database.js';
import { ProjectStatus, BidStatus } from '../types/index.js';
import { broadcastRankingUpdate } from '../socket/index.js';
import { CATEGORIES } from '../../../shared/constants/index.js';

/**
 * Recalculates ranks for all approved projects based on confirmed bids.
 * 
 * Algorithm:
 * 1. Find all APPROVED projects with CONFIRMED bids.
 * 2. Sum the bid amounts per project to get the `rankingValue`.
 * 3. Find the most recent bid timestamp for tie-breaking.
 * 4. Sort the projects descending by `rankingValue`, then ascending by earliest `lastBidAt`.
 * 5. Update the Rank sequentially (1, 2, 3...) using a transaction.
 */
export const recalculate = async () => {
  const projects = await prisma.project.findMany({
    where: { status: ProjectStatus.APPROVED },
    include: {
      bids: {
        where: { status: BidStatus.CONFIRMED },
        select: { amount: true, createdAt: true }
      }
    }
  });

  const rankedProjects = projects
    .filter((p: any) => p.bids.length > 0)
    .map((p: any) => {
      const rankingValue = p.bids.reduce((sum: number, bid: any) => sum + Number(bid.amount), 0);
      const lastBidAt = new Date(Math.max(...p.bids.map((b: any) => b.createdAt.getTime())));
      return { projectId: p.id, rankingValue, lastBidAt };
    })
    .sort((a: any, b: any) => {
      if (b.rankingValue !== a.rankingValue) {
        return b.rankingValue - a.rankingValue;
      }
      return a.lastBidAt.getTime() - b.lastBidAt.getTime();
    });

  await prisma.$transaction(
    rankedProjects.map((p: any, index: number) => 
      prisma.ranking.upsert({
        where: { projectId: p.projectId },
        update: {
          rank: index + 1,
          rankingValue: p.rankingValue,
          lastBidAt: p.lastBidAt
        },
        create: {
          projectId: p.projectId,
          rank: index + 1,
          rankingValue: p.rankingValue,
          lastBidAt: p.lastBidAt
        }
      })
    )
  );

  // Broadcast the update via Socket.io
  broadcastRankingUpdate();
};

export const getLeaderboard = async (filters: { category?: string, page?: number, limit?: number }) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = { project: { status: ProjectStatus.APPROVED } };
  
  if (filters.category) {
    where.project = { ...where.project, category: filters.category };
  }

  const [rankings, total] = await Promise.all([
    prisma.ranking.findMany({
      where,
      include: {
        project: {
          select: { name: true, slug: true, shortDescription: true, category: true, imageUrl: true }
        }
      },
      orderBy: { rank: 'asc' },
      skip,
      take: limit
    }),
    prisma.ranking.count({ where })
  ]);

  return {
    data: rankings,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getProjectRank = async (projectId: string) => {
  return prisma.ranking.findUnique({ where: { projectId } });
};

/**
 * Returns real daily race stats from the database.
 * Today is defined as midnight-to-midnight in server's local time.
 * Returns zeros/null when no bids exist — no fabricated data.
 */
export const getTodayStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayBids = await prisma.bid.findMany({
    where: {
      createdAt: { gte: todayStart },
      status: BidStatus.CONFIRMED,
    },
    include: {
      bidder: { select: { name: true } },
      project: { select: { name: true } },
    },
    orderBy: { amount: 'desc' },
  });

  const totalBidsToday = todayBids.length;
  const totalAmountToday = todayBids.reduce((sum: number, bid: any) => sum + Number(bid.amount), 0);
  const topBidder = todayBids.length > 0
    ? { name: todayBids[0].bidder.name, amount: Number(todayBids[0].amount), project: todayBids[0].project.name }
    : null;

  return {
    totalBidsToday,
    totalAmountToday,
    topBidder,
  };
};

export const getCategoryOverview = async () => {
  const results = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const [totalProducts, topRankings] = await Promise.all([
        prisma.project.count({
          where: { category: cat.value, status: ProjectStatus.APPROVED }
        }),
        prisma.ranking.findMany({
          where: {
            project: {
              category: cat.value,
              status: ProjectStatus.APPROVED
            }
          },
          include: {
            project: {
              select: { id: true, name: true, slug: true, url: true, imageUrl: true, shortDescription: true }
            }
          },
          orderBy: { rank: 'asc' },
          take: 3
        })
      ]);

      return {
        category: cat.value,
        label: cat.label,
        description: (cat as any).description || '',
        icon: cat.icon,
        totalProducts,
        topRankings: topRankings.map((r: any) => ({
          rank: r.rank,
          rankingValue: Number(r.rankingValue),
          projectId: r.projectId,
          name: r.project.name,
          slug: r.project.slug,
          url: r.project.url,
          imageUrl: r.project.imageUrl,
          shortDescription: r.project.shortDescription
        }))
      };
    })
  );

  return results;
};

