import { prisma } from '../config/database.js';

export const log = async (userId: string, action: string, entityType: string, entityId: string, metadata?: any, ipAddress?: string) => {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress
    }
  });
};

export const getAuditLogs = async (filters: { entityType?: string, entityId?: string, page?: number, limit?: number }) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.entityId) where.entityId = filters.entityId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    data: logs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
