import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recalculate, getTodayStats } from '../../src/services/ranking.service.js';
import { prisma } from '../../src/config/database.js';
import { ProjectStatus, BidStatus } from '../../src/types/index.js';

vi.mock('../../src/config/database.js', () => ({
  prisma: {
    project: { findMany: vi.fn() },
    ranking: { upsert: vi.fn(), findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
    bid: { findMany: vi.fn() },
    $transaction: vi.fn(async (promises) => Promise.all(promises))
  }
}));

vi.mock('../../src/socket/index.js', () => ({
  broadcastRankingUpdate: vi.fn()
}));

describe('Ranking Algorithm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ranks projects by total confirmed bid amount (highest first) and earliest timestamp', async () => {
    const mockProjects = [
      {
        id: 'project1',
        status: ProjectStatus.APPROVED,
        bids: [
          { amount: 100, createdAt: new Date('2023-01-01T10:00:00Z') },
          { amount: 150, createdAt: new Date('2023-01-01T11:00:00Z') } // Total: 250, Last: 11:00
        ]
      },
      {
        id: 'project2',
        status: ProjectStatus.APPROVED,
        bids: [
          { amount: 300, createdAt: new Date('2023-01-01T12:00:00Z') } // Total: 300, Last: 12:00
        ]
      },
      {
        id: 'project3',
        status: ProjectStatus.APPROVED,
        bids: [
          { amount: 250, createdAt: new Date('2023-01-01T09:00:00Z') } // Total: 250, Last: 09:00 (Wins tie against project1)
        ]
      }
    ];

    vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);
    
    await recalculate();

    expect(prisma.ranking.upsert).toHaveBeenCalledTimes(3);

    const calls = vi.mocked(prisma.ranking.upsert).mock.calls;
    
    // Check ranks
    // Rank 1: project2 (300)
    expect(calls[0][0].create.projectId).toBe('project2');
    expect(calls[0][0].create.rank).toBe(1);

    // Rank 2: project3 (250, earlier last bid: 09:00 vs 11:00)
    expect(calls[1][0].create.projectId).toBe('project3');
    expect(calls[1][0].create.rank).toBe(2);

    // Rank 3: project1 (250, later last bid)
    expect(calls[2][0].create.projectId).toBe('project1');
    expect(calls[2][0].create.rank).toBe(3);
  });

  it('does not rank projects without confirmed bids', async () => {
    const mockProjects = [
      {
        id: 'project1',
        status: ProjectStatus.APPROVED,
        bids: [{ amount: 500, createdAt: new Date() }]
      },
      {
        id: 'project2',
        status: ProjectStatus.APPROVED,
        bids: []
      }
    ];

    vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);
    
    await recalculate();

    expect(prisma.ranking.upsert).toHaveBeenCalledTimes(1);
    expect(vi.mocked(prisma.ranking.upsert).mock.calls[0][0].create.projectId).toBe('project1');
  });
});

describe('getTodayStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns zeros and null topBidder when there are no confirmed bids today', async () => {
    vi.mocked(prisma.bid.findMany).mockResolvedValue([]);

    const result = await getTodayStats();

    expect(result).toEqual({
      totalBidsToday: 0,
      totalAmountToday: 0,
      topBidder: null
    });
  });

  it('correctly aggregates confirmed bids placed today and identifies top bidder', async () => {
    const mockTodayBids = [
      {
        amount: 500,
        bidder: { name: 'Alice' },
        project: { name: 'Super AI' }
      },
      {
        amount: 250,
        bidder: { name: 'Bob' },
        project: { name: 'DevTool Pro' }
      }
    ];

    vi.mocked(prisma.bid.findMany).mockResolvedValue(mockTodayBids as any);

    const result = await getTodayStats();

    expect(result.totalBidsToday).toBe(2);
    expect(result.totalAmountToday).toBe(750);
    expect(result.topBidder).toEqual({
      name: 'Alice',
      amount: 500,
      project: 'Super AI'
    });
  });
});
