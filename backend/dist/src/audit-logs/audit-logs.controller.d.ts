import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(userId?: string, action?: string, startDate?: string, endDate?: string): Promise<({
        user: {
            id: number;
            name: string | null;
            email: string;
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
            crateId: number;
            categoryId: number | null;
            quantity: number;
            minQuantity: number;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.ItemStatus;
            lentTo: string | null;
        } | null;
    } & {
        id: number;
        timestamp: Date;
        userId: number;
        itemId: number | null;
        action: import(".prisma/client").$Enums.ActionType;
        quantityChange: number | null;
        details: string | null;
    })[]>;
}
