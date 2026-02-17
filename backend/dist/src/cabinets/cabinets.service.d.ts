import { CreateCabinetDto } from './dto/create-cabinet.dto';
import { UpdateCabinetDto } from './dto/update-cabinet.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class CabinetsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCabinetDto: CreateCabinetDto): Promise<{
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        qrCode: string;
    }>;
    findAll(includeCrates?: boolean): import(".prisma/client").Prisma.PrismaPromise<({
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
    remove(id: number): Promise<{
        number: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        qrCode: string;
    }>;
}
