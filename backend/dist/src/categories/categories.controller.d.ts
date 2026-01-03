import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: number;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
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
        id: number;
        name: string;
    })[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__CategoryClient<({
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
        id: number;
        name: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, updateCategoryDto: UpdateCategoryDto): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: number;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__CategoryClient<{
        id: number;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
