import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(userId?: string, action?: string, startDate?: string, endDate?: string): Promise<({
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
