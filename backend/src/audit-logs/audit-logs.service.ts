import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActionType } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

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

  async findAll() {
    return this.prisma.auditLog.findMany({
      include: { user: true, item: true },
      orderBy: { timestamp: 'desc' },
    });
  }
}
