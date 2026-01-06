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
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        crateId: number;
        categoryId: number | null;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
    exportShoppingList(res: Response): Promise<void>;
    search(q: string): Promise<({
        crate: {
            cabinet: {
                number: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                qrCode: string;
                location: string | null;
            };
        } & {
            number: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            categoryId: number | null;
            qrCode: string;
            cabinetId: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        crateId: number;
        categoryId: number | null;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
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
                id: number;
                createdAt: Date;
                updatedAt: Date;
                qrCode: string;
                location: string | null;
            };
        } & {
            number: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            categoryId: number | null;
            qrCode: string;
            cabinetId: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        crateId: number;
        categoryId: number | null;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    })[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__ItemClient<({
        auditLogs: {
            timestamp: Date;
            action: import(".prisma/client").$Enums.ActionType;
            quantityChange: number | null;
            details: string | null;
            id: number;
            userId: number;
            itemId: number | null;
        }[];
        crate: {
            cabinet: {
                number: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                qrCode: string;
                location: string | null;
            };
        } & {
            number: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            categoryId: number | null;
            qrCode: string;
            cabinetId: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        crateId: number;
        categoryId: number | null;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, updateItemDto: UpdateItemDto, req: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        crateId: number;
        categoryId: number | null;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
    updateQuantity(id: number, updateQuantityDto: UpdateQuantityDto, req: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        crateId: number;
        categoryId: number | null;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
    lend(id: number, lendItemDto: LendItemDto, req: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        crateId: number;
        categoryId: number | null;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
    transfer(id: number, transferItemDto: TransferItemDto, req: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        crateId: number;
        categoryId: number | null;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        crateId: number;
        categoryId: number | null;
        quantity: number;
        minQuantity: number;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.ItemStatus;
        lentTo: string | null;
    }>;
}
