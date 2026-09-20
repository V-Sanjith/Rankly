import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from '../../src/services/bid.service.js';
import { prisma } from '../../src/config/database.js';
import { ForbiddenError, ValidationError, NotFoundError } from '../../src/middleware/error.middleware.js';
import { ProjectStatus, BidStatus } from '../../src/types/index.js';

vi.mock('../../src/config/database.js', () => ({
  prisma: {
    project: { findUnique: vi.fn() },
    bidConfig: { findFirst: vi.fn() },
    bid: { findFirst: vi.fn(), create: vi.fn() },
    payment: { create: vi.fn() },
    $transaction: vi.fn(async (cb) => cb(prisma))
  }
}));

vi.mock('../../src/services/payment.service.js', () => ({
  createOrder: vi.fn().mockResolvedValue({ id: 'order_123' })
}));

describe('Bid Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NotFoundError if project does not exist', async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

    await expect(create('user1', 'proj1', 500)).rejects.toThrow(NotFoundError);
  });

  it('throws ValidationError if project is not APPROVED', async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'proj1', status: ProjectStatus.PENDING_REVIEW } as any);

    await expect(create('user1', 'proj1', 500)).rejects.toThrow(ValidationError);
    await expect(create('user1', 'proj1', 500)).rejects.toThrow('Project is not approved for bidding');
  });

  it('blocks self-bidding and throws ForbiddenError', async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'proj1', ownerId: 'user1', status: ProjectStatus.APPROVED } as any);
    vi.mocked(prisma.bidConfig.findFirst).mockResolvedValue({ allowSelfBid: false, minBid: 199 } as any);

    await expect(create('user1', 'proj1', 500)).rejects.toThrow(ForbiddenError);
    await expect(create('user1', 'proj1', 500)).rejects.toThrow('Project owners cannot bid on their own projects');
  });

  it('enforces minimum bid amount', async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'proj1', ownerId: 'other_user', status: ProjectStatus.APPROVED } as any);
    vi.mocked(prisma.bidConfig.findFirst).mockResolvedValue({ allowSelfBid: false, minBid: 199 } as any);

    await expect(create('user1', 'proj1', 100)).rejects.toThrow(ValidationError);
    await expect(create('user1', 'proj1', 100)).rejects.toThrow('Minimum bid amount is 199');
  });

  it('throws ValidationError if user has pending bid for same project', async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'proj1', ownerId: 'other_user', status: ProjectStatus.APPROVED } as any);
    vi.mocked(prisma.bidConfig.findFirst).mockResolvedValue({ allowSelfBid: false, minBid: 199 } as any);
    vi.mocked(prisma.bid.findFirst).mockResolvedValue({ id: 'bid1', status: BidStatus.PENDING } as any);

    await expect(create('user1', 'proj1', 500)).rejects.toThrow(ValidationError);
    await expect(create('user1', 'proj1', 500)).rejects.toThrow('You already have a pending bid for this project');
  });

  it('creates bid successfully when validation passes', async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'proj1', ownerId: 'other_user', status: ProjectStatus.APPROVED } as any);
    vi.mocked(prisma.bidConfig.findFirst).mockResolvedValue({ allowSelfBid: false, minBid: 199, currency: 'INR' } as any);
    vi.mocked(prisma.bid.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.bid.create).mockResolvedValue({ id: 'bid1', currency: 'INR' } as any);
    vi.mocked(prisma.payment.create).mockResolvedValue({ id: 'pay1' } as any);

    const result = await create('user1', 'proj1', 500);

    expect(result.bid.id).toBe('bid1');
    expect(prisma.bid.create).toHaveBeenCalled();
  });
});
