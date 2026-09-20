import { prisma } from '../config/database.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/error.middleware.js';
import { ProjectStatus, BidStatus, PaymentStatus } from '../types/index.js';
import { env } from '../config/env.js';
import { log } from './audit.service.js';
import { createOrder, verifySignature } from './payment.service.js';
import { recalculate } from './ranking.service.js';

export const generateSlug = async (name: string): Promise<string> => {
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  let exists = await prisma.project.findUnique({ where: { slug } });
  let counter = 1;
  
  while (exists) {
    slug = `${slug}-${counter}`;
    exists = await prisma.project.findUnique({ where: { slug } });
    counter++;
  }
  
  return slug;
};

export const create = async (userId: string, data: any) => {
  const existingUrl = await prisma.project.findFirst({ where: { url: data.url } });
  if (existingUrl) {
    throw new ValidationError('A project with this URL already exists');
  }

  const slug = await generateSlug(data.name);

  return prisma.project.create({
    data: {
      ...data,
      slug,
      ownerId: userId,
      status: ProjectStatus.PENDING_REVIEW,
    }
  });
};

export const getBySlug = async (slug: string) => {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      owner: { select: { name: true } },
      ranking: true,
    }
  });

  if (!project || project.status !== ProjectStatus.APPROVED) {
    throw new NotFoundError('Project not found');
  }

  return project;
};

export const list = async (filters: { category?: string, status?: string, page?: number, limit?: number }) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  // Public always sees APPROVED, admin can see others
  where.status = filters.status || ProjectStatus.APPROVED;
  
  if (filters.category) {
    where.category = filters.category;
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { ranking: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.project.count({ where })
  ]);

  return {
    data: projects,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getMyProjects = async (userId: string) => {
  return prisma.project.findMany({
    where: { ownerId: userId },
    include: { ranking: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const update = async (userId: string, projectId: string, data: any) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.ownerId !== userId) {
    throw new ForbiddenError('Not authorized to update this project');
  }

  return prisma.project.update({
    where: { id: projectId },
    data
  });
};

export const changeStatus = async (projectId: string, status: ProjectStatus, adminId: string) => {
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status }
  });

  await log(adminId, 'CHANGE_PROJECT_STATUS', 'Project', projectId, { status });

  return project;
};

export const initiatePromotion = async (data: {
  url: string;
  category: string;
  amount: number;
  name?: string;
  contactEmail?: string;
}) => {
  const config = await prisma.bidConfig.findFirst();
  const minBid = Number(config?.minBid || 199);
  if (data.amount < minBid) {
    throw new ValidationError(`Minimum bid amount is ₹${minBid}`);
  }

  const DOMAIN_REGEX = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/;
  if (!DOMAIN_REGEX.test(data.url.trim())) {
    throw new ValidationError('Please enter a valid website domain with an extension (e.g., example.com, https://myproject.io)');
  }

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new ValidationError('Razorpay payment gateway is not yet configured. Please add your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env to enable payments.');
  }

  let cleanUrl = data.url.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(cleanUrl);
  } catch {
    throw new ValidationError('Invalid URL provided');
  }

  let projectName = data.name?.trim();
  if (!projectName) {
    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    const rawName = hostname.split('.')[0];
    projectName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  }

  const email = data.contactEmail?.trim() || `promoter@${parsedUrl.hostname.replace(/^www\./, '')}`;
  let user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: projectName + ' Owner',
        email,
        passwordHash: 'public-promoter',
        role: 'USER',
        status: 'ACTIVE'
      }
    });
  }

  let project = await prisma.project.findFirst({
    where: {
      OR: [
        { url: cleanUrl },
        { url: cleanUrl.replace(/^https?:\/\//, '') },
        { url: `http://${cleanUrl.replace(/^https?:\/\//, '')}` },
        { url: `https://${cleanUrl.replace(/^https?:\/\//, '')}` }
      ]
    }
  });

  if (!project) {
    const slug = await generateSlug(projectName);
    project = await prisma.project.create({
      data: {
        name: projectName,
        slug,
        url: cleanUrl,
        shortDescription: `${projectName} — Promoted project on Rankly`,
        description: `${projectName} is a promoted project discovered on Rankly under ${data.category}.`,
        category: data.category || 'SAAS',
        contactEmail: email,
        ownerId: user.id,
        status: ProjectStatus.PENDING_REVIEW
      }
    });
  }

  const bid = await prisma.bid.create({
    data: {
      projectId: project.id,
      bidderId: user.id,
      amount: data.amount,
      currency: config?.currency || 'INR',
      status: BidStatus.PENDING
    }
  });

  const order = await createOrder(data.amount, bid.currency, bid.id);

  await prisma.payment.create({
    data: {
      userId: user.id,
      bidId: bid.id,
      providerOrderId: order.id,
      amount: data.amount,
      currency: bid.currency,
      status: PaymentStatus.CREATED
    }
  });

  return {
    orderId: order.id,
    keyId: env.RAZORPAY_KEY_ID || '',
    amount: data.amount * 100,
    currency: bid.currency,
    bidId: bid.id,
    projectId: project.id,
    projectName: project.name,
    url: project.url
  };
};

export const verifyPromotion = async (paymentData: {
  bidId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new ValidationError('Razorpay payment gateway is not configured. Real Razorpay credentials are required to verify payments.');
  }

  const { bidId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: razorpay_order_id }
  });
  if (!payment) throw new NotFoundError('Payment record not found');
  if (payment.bidId !== bidId) throw new ValidationError('Payment does not match bid');

  const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) throw new ValidationError('Invalid payment signature');

  const bid = await prisma.bid.findUnique({ where: { id: bidId } });
  if (!bid) throw new NotFoundError('Bid not found');

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        providerPaymentId: razorpay_payment_id,
        providerSignature: razorpay_signature
      }
    }),
    prisma.bid.update({
      where: { id: bidId },
      data: { status: BidStatus.CONFIRMED }
    }),
    prisma.project.update({
      where: { id: bid.projectId },
      data: { status: ProjectStatus.APPROVED }
    })
  ]);

  await recalculate();

  const updatedProject = await prisma.project.findUnique({
    where: { id: bid.projectId },
    include: { ranking: true }
  });

  return {
    project: updatedProject,
    bid: { id: bid.id, amount: bid.amount, status: 'CONFIRMED' }
  };
};

