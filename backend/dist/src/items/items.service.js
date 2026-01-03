"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const client_1 = require("@prisma/client");
let ItemsService = class ItemsService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async create(createItemDto, photoUrl, userId) {
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
            await this.auditService.logAction(userId, client_1.ActionType.CREATE, item.id, `Created item ${item.name}`, item.quantity);
        }
        return item;
    }
    async findAll(query, lowStock) {
        const where = {};
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
    findOne(id) {
        return this.prisma.item.findUnique({
            where: { id },
            include: { crate: { include: { cabinet: true } }, auditLogs: true },
        });
    }
    async update(id, updateItemDto, userId) {
        const item = await this.prisma.item.update({
            where: { id },
            data: updateItemDto,
        });
        if (userId) {
            await this.auditService.logAction(userId, client_1.ActionType.UPDATE, item.id, 'Updated item details');
        }
        return item;
    }
    async updateQuantity(id, change, userId) {
        const item = await this.prisma.item.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        const newItem = await this.prisma.item.update({
            where: { id },
            data: { quantity: item.quantity + change },
        });
        await this.auditService.logAction(userId, client_1.ActionType.STOCK_CHANGE, id, `Stock change ${change}`, change);
        return newItem;
    }
    async lend(id, lentTo, userId) {
        const item = await this.prisma.item.update({
            where: { id },
            data: { status: 'LENT', lentTo },
        });
        await this.auditService.logAction(userId, client_1.ActionType.LENT, id, `Lent to ${lentTo}`);
        return item;
    }
    async returnItem(id, userId) {
        const item = await this.prisma.item.update({
            where: { id },
            data: { status: 'AVAILABLE', lentTo: null },
        });
        await this.auditService.logAction(userId, client_1.ActionType.UPDATE, id, `Returned`);
        return item;
    }
    async transfer(id, targetCrateId, userId) {
        const item = await this.prisma.item.update({
            where: { id },
            data: { crateId: targetCrateId },
        });
        await this.auditService.logAction(userId, client_1.ActionType.MOVE, id, `Moved to crate ${targetCrateId}`);
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
        const itemsPerCategory = await this.prisma.item.groupBy({
            by: ['categoryId'],
            _count: {
                id: true,
            },
        });
        const categories = await this.prisma.category.findMany();
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
    async remove(id) {
        const item = await this.prisma.item.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        if (item.quantity > 0) {
            throw new Error('Cannot delete item with stored quantity. Reduce stock to 0 first.');
        }
        return this.prisma.item.delete({ where: { id } });
    }
};
exports.ItemsService = ItemsService;
exports.ItemsService = ItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], ItemsService);
//# sourceMappingURL=items.service.js.map