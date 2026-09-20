import { prisma } from '../config/database.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/error.middleware.js';
import { BidStatus, PaymentStatus, ProjectStatus } from '../types/index.js';
import { createOrder, verifySignature } from './payment.service.js';
import { recalculate } from './ranking.service.js';

export const create = async (userId: string, projectId: string, amount: number) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project not found');
  if (project.status !== ProjectStatus.APPROVED) throw new ValidationError('Project is not approved for bidding');

  // CRITICAL: Block self-bidding
  const config = await prisma.bidConfig.findFirst();
  if (!config?.allowSelfBid && project.ownerId === userId) {
    throw new ForbiddenError('Project owners cannot bid on their own projects');
  }

  const minBid = Number(config?.minBid || 199);
  if (amount < minBid) {
    throw new ValidationError(`Minimum bid amount is ${minBid}`);
  }

  // Check for existing pending bid
  const pendingBid = await prisma.bid.findFirst({
    where: { bidderId: userId, projectId, status: BidStatus.PENDING }
  });
  
  if (pendingBid) {
    throw new ValidationError('You already have a pending bid for this project. Please complete or cancel it.');
  }

  return await prisma.$transaction(async (tx: any) => {
    const bid = await tx.bid.create({
      data: {
        projectId,
        bidderId: userId,
        amount,
        currency: config?.currency || 'INR',
        status: BidStatus.PENDING,
      }
    });

    // Create payment order
    const order = await createOrder(amount, bid.currency, bid.id);

    const payment = await tx.payment.create({
      data: {
        userId,
        bidId: bid.id,
        providerOrderId: order.id,
        amount,
        currency: bid.currency,
        status: PaymentStatus.CREATED,
      }
    });

    return { bid, payment, order };
  });
};

export const confirmBid = async (bidId: string, paymentData: any) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
  
  const payment = await prisma.payment.findUnique({ where: { providerOrderId: razorpay_order_id } });
  if (!payment) throw new NotFoundError('Payment not found');
  
  if (payment.bidId !== bidId) throw new ValidationError('Payment does not match bid');

  const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) throw new ValidationError('Invalid payment signature');

  const updatedBid = await prisma.$transaction(async (tx: any) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        providerPaymentId: razorpay_payment_id,
        providerSignature: razorpay_signature
      }
    });

    const bid = await tx.bid.update({
      where: { id: bidId },
      data: { status: BidStatus.CONFIRMED }
    });

    return bid;
  });

  // Trigger ranking recalculation asynchronously
  recalculate().catch(console.error);

  return updatedBid;
};

export const getMyBids = async (userId: string) => {
  return prisma.bid.findMany({
    where: { bidderId: userId },
    include: { project: { select: { name: true, slug: true } }, payment: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const getBidsByProject = async (projectId: string) => {
  return prisma.bid.findMany({
    where: { projectId, status: BidStatus.CONFIRMED },
    include: { bidder: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });
};
