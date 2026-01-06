import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActionType } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) { }

  async logAction(
    userId: number,
    action: ActionType,
    itemId?: number,
    details?: string,
    quantityChange?: number,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        itemId,
        details,
        quantityChange,
      },
    });
  }

  async findAll(filters: {
    userId?: number;
    action?: ActionType;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      include: { user: true, item: true },
      orderBy: { timestamp: 'desc' },
    });
  }
}
