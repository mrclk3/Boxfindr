import type { Response } from 'express';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { LendItemDto } from './dto/lend-item.dto';
import { TransferItemDto } from './dto/transfer-item.dto';
export declare class ItemsController {
    private readonly itemsService;
    constructor(itemsService: ItemsService);
    create(createItemDto: CreateItemDto, file: Express.Multer.File, req: any): Promise<{
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
    exportShoppingList(res: Response): Promise<void>;
    search(q: string): Promise<({
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
    getStats(): Promise<{
        totalItems: number;
        lowStockItems: number;
        totalQuantity: number;
        categories: {
            name: string;
            count: number;
        }[];
    }>;
    findAll(lowStock: string): Promise<({
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
    update(id: number, updateItemDto: UpdateItemDto, req: any): Promise<{
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
    updateQuantity(id: number, updateQuantityDto: UpdateQuantityDto, req: any): Promise<{
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
    lend(id: number, lendItemDto: LendItemDto, req: any): Promise<{
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
    transfer(id: number, transferItemDto: TransferItemDto, req: any): Promise<{
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
