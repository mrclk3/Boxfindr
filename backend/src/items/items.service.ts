import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditLogsService,
  ) {}

  async create(
    createItemDto: CreateItemDto,
    photoUrl?: string,
    userId?: number,
  ) {
    const item = await this.prisma.item.create({
      data: {
        name: createItemDto.name,
        quantity: +createItemDto.quantity,
        minQuantity: +createItemDto.minQuantity,
        photoUrl: photoUrl,
        crate: { connect: { id: +createItemDto.crateId } },
        ...(createItemDto.categoryId
          ? { category: { connect: { id: +createItemDto.categoryId } } }
          : {}),
      },
    });
    if (userId) {
      await this.auditService.logAction(
        userId,
        ActionType.CREATE,
        item.id,
        `Created item ${item.name}`,
        item.quantity,
      );
    }
    return item;
  }

  async findAll(query?: string, lowStock?: boolean) {
    const where: any = {};

    if (query) {
      where.name = { contains: query, mode: 'insensitive' };
    }

    if (lowStock) {
      where.quantity = { lt: 5 };
    }

    return this.prisma.item.findMany({
      where,
      include: { crate: { include: { cabinet: true } } },
    });
  }

  findOne(id: number) {
    return this.prisma.item.findUnique({
      where: { id },
      include: { crate: { include: { cabinet: true } }, auditLogs: true },
    });
  }

  async update(id: number, updateItemDto: UpdateItemDto, userId?: number) {
    const item = await this.prisma.item.update({
      where: { id },
      data: updateItemDto,
    });
    if (userId) {
      await this.auditService.logAction(
        userId,
        ActionType.UPDATE,
        item.id,
        'Updated item details',
      );
    }
    return item;
  }

  async updateQuantity(id: number, change: number, userId: number) {
    // Transaction?
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');

    const newItem = await this.prisma.item.update({
      where: { id },
      data: { quantity: item.quantity + change },
    });

    await this.auditService.logAction(
      userId,
      ActionType.STOCK_CHANGE,
      id,
      `Stock change ${change}`,
      change,
    );
    return newItem;
  }

  async lend(id: number, lentTo: string, userId: number) {
    const item = await this.prisma.item.update({
      where: { id },
      data: { status: 'LENT', lentTo },
    });
    await this.auditService.logAction(
      userId,
      ActionType.LENT,
      id,
      `Lent to ${lentTo}`,
    );
    return item;
  }

  async returnItem(id: number, userId: number) {
    const item = await this.prisma.item.update({
      where: { id },
      data: { status: 'AVAILABLE', lentTo: null },
    });
    await this.auditService.logAction(
      userId,
      ActionType.UPDATE,
      id,
      `Returned`,
    );
    return item;
  }

  async transfer(id: number, targetCrateId: number, userId: number) {
    const item = await this.prisma.item.update({
      where: { id },
      data: { crateId: targetCrateId },
    });
    await this.auditService.logAction(
      userId,
      ActionType.MOVE,
      id,
      `Moved to crate ${targetCrateId}`,
    );
    return item;
  }

  async getStats() {
    const totalItems = await this.prisma.item.count();
    const lowStockItems = await this.prisma.item.count({
      where: { quantity: { lt: 5 } },
    });
    const totalQuantity = await this.prisma.item.aggregate({
      _sum: { quantity: true },
    });

    // Group items by category to get counts
    const itemsPerCategory = await this.prisma.item.groupBy({
      by: ['categoryId'],
      _count: {
        id: true,
      },
    });

    // Fetch all categories to get names
    const categories = await this.prisma.category.findMany();

    // Map counts to category names
    const categoryStats = categories.map((cat) => {
      const countObj = itemsPerCategory.find((c) => c.categoryId === cat.id);
      return {
        name: cat.name,
        count: countObj ? countObj._count.id : 0,
      };
    });

    return {
      totalItems,
      lowStockItems,
      totalQuantity: totalQuantity._sum.quantity || 0,
      categories: categoryStats,
    };
  }

  async remove(id: number) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    if (item.quantity > 0) {
      throw new Error(
        'Cannot delete item with stored quantity. Reduce stock to 0 first.',
      ); // Controller should handle BadRequest
    }
    return this.prisma.item.delete({ where: { id } });
  }
}
