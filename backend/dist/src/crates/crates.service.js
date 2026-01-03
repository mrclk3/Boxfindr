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
exports.CratesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CratesService = class CratesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createCrateDto) {
        return this.prisma.crate.create({
            data: {
                number: createCrateDto.number,
                qrCode: createCrateDto.qrCode,
                cabinet: { connect: { id: createCrateDto.cabinetId } },
                category: createCrateDto.categoryId
                    ? { connect: { id: createCrateDto.categoryId } }
                    : undefined,
            },
        });
    }
    findAll() {
        return this.prisma.crate.findMany({
            include: { cabinet: true, category: true },
        });
    }
    findOne(id) {
        return this.prisma.crate.findUnique({
            where: { id },
            include: { items: true, cabinet: true },
        });
    }
    async findOneByQr(qrCode) {
        const crate = await this.prisma.crate.findUnique({
            where: { qrCode },
            include: { items: true, cabinet: true },
        });
        if (!crate)
            throw new common_1.NotFoundException(`Crate with QR ${qrCode} not found`);
        return crate;
    }
    update(id, updateCrateDto) {
        return this.prisma.crate.update({
            where: { id },
            data: updateCrateDto,
        });
    }
    async move(id, targetCabinetId) {
        return this.prisma.crate.update({
            where: { id },
            data: { cabinetId: targetCabinetId },
        });
    }
    remove(id) {
        return this.prisma.crate.delete({ where: { id } });
    }
};
exports.CratesService = CratesService;
exports.CratesService = CratesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CratesService);
//# sourceMappingURL=crates.service.js.map