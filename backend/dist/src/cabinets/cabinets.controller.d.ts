import { CabinetsService } from './cabinets.service';
import { CreateCabinetDto } from './dto/create-cabinet.dto';
import { UpdateCabinetDto } from './dto/update-cabinet.dto';
export declare class CabinetsController {
    private readonly cabinetsService;
    constructor(cabinetsService: CabinetsService);
    create(createCabinetDto: CreateCabinetDto): import(".prisma/client").Prisma.Prisma__CabinetClient<{
        number: string;
        location: string | null;
        qrCode: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(includeCrates?: string): import(".prisma/client").Prisma.PrismaPromise<({
        crates: {
            number: string;
            qrCode: string;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            cabinetId: number;
            categoryId: number | null;
        }[];
    } & {
        number: string;
        location: string | null;
        qrCode: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    })[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__CabinetClient<({
        crates: {
            number: string;
            qrCode: string;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            cabinetId: number;
            categoryId: number | null;
        }[];
    } & {
        number: string;
        location: string | null;
        qrCode: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, updateCabinetDto: UpdateCabinetDto): import(".prisma/client").Prisma.Prisma__CabinetClient<{
        number: string;
        location: string | null;
        qrCode: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__CabinetClient<{
        number: string;
        location: string | null;
        qrCode: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
