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
  ) { }

  async create(
    createItemDto: CreateItemDto,
    photoUrl?: string,
    userId?: number,
  ) {
    console.log('Creating item:', createItemDto, photoUrl, userId);
    try {
      const item = await this.prisma.item.create({
        data: {
          name: createItemDto.name,
          // Ensure numbers are numbers, fallback to 0 if missing/NaN to avoid Prisma crash
          quantity: +(createItemDto.quantity || 0),
          minQuantity: +(createItemDto.minQuantity || 0),
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
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async findAll(query?: string, lowStock?: boolean) {
    const where: any = {};

    if (query) {
      where.name = { contains: query, mode: 'insensitive' };
    }

    // Since we cannot compare columns in where clause easily with Prisma,
    // we fetch with other filters first and then filter in memory for lowStock.
    // If lowStock is false, we don't modify the query results further (unless pagination is added later).

    const items = await this.prisma.item.findMany({
      where,
      include: { crate: { include: { cabinet: true } } },
    });

    if (lowStock) {
      return items.filter((item) => item.quantity < item.minQuantity);
    }

    return items;
  }

  findOne(id: number) {
    return this.prisma.item.findUnique({
      where: { id },
      include: { crate: { include: { cabinet: true } }, auditLogs: true },
    });
  }

  async update(id: number, updateItemDto: UpdateItemDto, userId?: number) {
    console.log('Updating item:', id, updateItemDto, userId);
    try {
      // Explicitly case known numeric fields to ensure they are not strings
      const data: any = { ...updateItemDto };
      if (data.quantity !== undefined && data.quantity !== null) data.quantity = +data.quantity;
      if (data.minQuantity !== undefined && data.minQuantity !== null) data.minQuantity = +data.minQuantity;
      if (data.crateId !== undefined && data.crateId !== null) data.crateId = +data.crateId;
      if (data.categoryId !== undefined && data.categoryId !== null) data.categoryId = +data.categoryId;

      // Clean up fields that shouldn't be here if they came from partial DTO but are not in schema as scalars
      // e.g. if categoryId is intentionally passed.

      const item = await this.prisma.item.update({
        where: { id },
        data: data,
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
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async updateQuantity(id: number, change: number, userId: number) {
    // Transaction?
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');

    const newQuantity = item.quantity + change;
    if (newQuantity < 0) {
      throw new Error('Quantity cannot be negative'); // Simple error, controller handles 500 or we can use BadRequestException
    }

    const newItem = await this.prisma.item.update({
      where: { id },
      data: { quantity: newQuantity },
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

    // Fetch all items to check minQuantity vs quantity
    // Optimization: Depending on item count, raw query might be better, but this is fine for < 10k items
    const allItems = await this.prisma.item.findMany({
      select: { quantity: true, minQuantity: true }
    });

    const lowStockItems = allItems.filter(i => i.quantity < i.minQuantity).length;

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

  async getShoppingList(): Promise<string> {
    const items = await this.prisma.item.findMany({
      include: {
        category: true,
        crate: {
          include: { cabinet: true }
        }
      }
    });

    const lowStockItems = items.filter(item => item.quantity < item.minQuantity);

    const header = 'Item,Category,Current Quantity,Min Quantity,Missing Amount,Cabinet,Crate\n';
    const rows = lowStockItems.map(item => {
      const missing = item.minQuantity - item.quantity;
      // Handle potential nulls and special characters (simple CSV escaping)
      const name = item.name.replace(/"/g, '""');
      const category = (item.category?.name || '').replace(/"/g, '""');

      return `"${name}","${category}",${item.quantity},${item.minQuantity},${missing},"${item.crate.cabinet.number}","${item.crate.number}"`;
    }).join('\n');

    return header + rows;
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
