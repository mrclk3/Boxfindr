import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class ItemsService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditLogsService);
    create(createItemDto: CreateItemDto, photoUrl?: string, userId?: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        crateId: number;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
    findAll(query?: string, lowStock?: boolean): Promise<({
        crate: {
            cabinet: {
                number: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                location: string | null;
                qrCode: string;
            };
        } & {
            number: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            qrCode: string;
            cabinetId: number;
            categoryId: number | null;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        crateId: number;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    })[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__ItemClient<({
        auditLogs: {
            id: number;
            timestamp: Date;
            action: import(".prisma/client").$Enums.ActionType;
            quantityChange: number | null;
            details: string | null;
            userId: number;
            itemId: number | null;
        }[];
        crate: {
            cabinet: {
                number: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                location: string | null;
                qrCode: string;
            };
        } & {
            number: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            qrCode: string;
            cabinetId: number;
            categoryId: number | null;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        crateId: number;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, updateItemDto: UpdateItemDto, userId?: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        crateId: number;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
    updateQuantity(id: number, change: number, userId: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        crateId: number;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
    lend(id: number, lentTo: string, userId: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        crateId: number;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
    returnItem(id: number, userId: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        crateId: number;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
    transfer(id: number, targetCrateId: number, userId: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        crateId: number;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
    getStats(): Promise<{
        totalItems: number;
        lowStockItems: number;
        totalQuantity: number;
        categories: {
            name: string;
            count: number;
        }[];
    }>;
    getShoppingList(): Promise<string>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: number | null;
        crateId: number;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
}
