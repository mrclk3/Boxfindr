import { PrismaService } from '../prisma/prisma.service';
import { ActionType } from '@prisma/client';
export declare class AuditLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(userId: number, action: ActionType, itemId?: number, details?: string, quantityChange?: number): Promise<{
        id: number;
        timestamp: Date;
        action: import(".prisma/client").$Enums.ActionType;
        quantityChange: number | null;
        details: string | null;
        userId: number;
        itemId: number | null;
    }>;
    findAll(): Promise<({
        user: {
            id: number;
            email: string;
            name: string | null;
            password: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        };
        item: {
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
        } | null;
    } & {
        id: number;
        timestamp: Date;
        action: import(".prisma/client").$Enums.ActionType;
        quantityChange: number | null;
        details: string | null;
        userId: number;
        itemId: number | null;
    })[]>;
}
