import { CratesService } from './crates.service';
import { CreateCrateDto } from './dto/create-crate.dto';
import { UpdateCrateDto } from './dto/update-crate.dto';
export declare class CratesController {
    private readonly cratesService;
    constructor(cratesService: CratesService);
    create(createCrateDto: CreateCrateDto): import(".prisma/client").Prisma.Prisma__CrateClient<{
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string;
        cabinetId: number;
        categoryId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        cabinet: {
            number: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            qrCode: string;
        };
        category: {
            id: number;
            name: string;
        } | null;
    } & {
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string;
        cabinetId: number;
        categoryId: number | null;
    })[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__CrateClient<({
        cabinet: {
            number: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            qrCode: string;
        };
        items: {
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
        }[];
    } & {
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string;
        cabinetId: number;
        categoryId: number | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs> | Promise<{
        cabinet: {
            number: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            qrCode: string;
        };
        items: {
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
        }[];
    } & {
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string;
        cabinetId: number;
        categoryId: number | null;
    }>;
    update(id: number, updateCrateDto: UpdateCrateDto): import(".prisma/client").Prisma.Prisma__CrateClient<{
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string;
        cabinetId: number;
        categoryId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    move(id: number, cabinetId: number): Promise<{
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string;
        cabinetId: number;
        categoryId: number | null;
    }>;
    remove(id: number, req: any): Promise<{
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string;
        cabinetId: number;
        categoryId: number | null;
    }>;
}
