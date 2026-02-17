"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CabinetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CabinetsService = class CabinetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCabinetDto) {
        try {
            return await this.prisma.cabinet.create({
                data: {
                    number: createCabinetDto.number,
                    location: createCabinetDto.location,
                    qrCode: createCabinetDto.qrCode,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Cabinet with this number or QR code already exists');
            }
            throw error;
        }
    }
    findAll(includeCrates = false) {
        return this.prisma.cabinet.findMany({
            include: {
                crates: includeCrates,
            },
        });
    }
    findOne(id) {
        return this.prisma.cabinet.findUnique({
            where: { id },
            include: { crates: true },
        });
    }
    update(id, updateCabinetDto) {
        return this.prisma.cabinet.update({
            where: { id },
            data: updateCabinetDto,
        });
    }
    async remove(id) {
        const cabinet = await this.prisma.cabinet.findUnique({
            where: { id },
            include: { crates: true },
        });
        if (!cabinet) {
            throw new common_1.NotFoundException(`Cabinet with ID ${id} not found`);
        }
        if (cabinet.crates.length > 0) {
            throw new common_1.BadRequestException('Cannot delete cabinet with crates');
        }
        return this.prisma.cabinet.delete({ where: { id } });
    }
};
exports.CabinetsService = CabinetsService;
exports.CabinetsService = CabinetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CabinetsService);
//# sourceMappingURL=cabinets.service.js.map