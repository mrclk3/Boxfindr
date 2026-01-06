import { CabinetsService } from './cabinets.service';
import { CreateCabinetDto } from './dto/create-cabinet.dto';
import { UpdateCabinetDto } from './dto/update-cabinet.dto';
export declare class CabinetsController {
    private readonly cabinetsService;
    constructor(cabinetsService: CabinetsService);
    create(createCabinetDto: CreateCabinetDto): import(".prisma/client").Prisma.Prisma__CabinetClient<{
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        qrCode: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(includeCrates?: string): import(".prisma/client").Prisma.PrismaPromise<({
        crates: {
            number: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            qrCode: string;
            cabinetId: number;
            categoryId: number | null;
        }[];
    } & {
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        qrCode: string;
    })[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__CabinetClient<({
        crates: {
            number: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            qrCode: string;
            cabinetId: number;
            categoryId: number | null;
        }[];
    } & {
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        qrCode: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, updateCabinetDto: UpdateCabinetDto): import(".prisma/client").Prisma.Prisma__CabinetClient<{
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        qrCode: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__CabinetClient<{
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        qrCode: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
