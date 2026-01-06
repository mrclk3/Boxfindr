import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class ItemsService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditLogsService);
    create(createItemDto: CreateItemDto, photoUrl?: string, userId?: number): Promise<{
        name: string;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        crateId: number;
        categoryId: number | null;
    }>;
    findAll(query?: string, lowStock?: boolean): Promise<({
        crate: {
            cabinet: {
                number: string;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                qrCode: string;
                location: string | null;
            };
        } & {
            number: string;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            categoryId: number | null;
            qrCode: string;
            cabinetId: number;
        };
    } & {
        name: string;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        crateId: number;
        categoryId: number | null;
    })[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__ItemClient<({
        crate: {
            cabinet: {
                number: string;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                qrCode: string;
                location: string | null;
            };
        } & {
            number: string;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            categoryId: number | null;
            qrCode: string;
            cabinetId: number;
        };
        auditLogs: {
            id: number;
            timestamp: Date;
            userId: number;
            itemId: number | null;
            action: import(".prisma/client").$Enums.ActionType;
            quantityChange: number | null;
            details: string | null;
        }[];
    } & {
        name: string;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        crateId: number;
        categoryId: number | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, updateItemDto: UpdateItemDto, userId?: number): Promise<{
        name: string;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        crateId: number;
        categoryId: number | null;
    }>;
    updateQuantity(id: number, change: number, userId: number): Promise<{
        name: string;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        crateId: number;
        categoryId: number | null;
    }>;
    lend(id: number, lentTo: string, userId: number): Promise<{
        name: string;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        crateId: number;
        categoryId: number | null;
    }>;
    returnItem(id: number, userId: number): Promise<{
        name: string;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        crateId: number;
        categoryId: number | null;
    }>;
    transfer(id: number, targetCrateId: number, userId: number): Promise<{
        name: string;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        crateId: number;
        categoryId: number | null;
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
        name: string;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        crateId: number;
        categoryId: number | null;
    }>;
}
