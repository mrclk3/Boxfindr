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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CratesController = void 0;
const common_1 = require("@nestjs/common");
const crates_service_1 = require("./crates.service");
const create_crate_dto_1 = require("./dto/create-crate.dto");
const update_crate_dto_1 = require("./dto/update-crate.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CratesController = class CratesController {
    cratesService;
    constructor(cratesService) {
        this.cratesService = cratesService;
    }
    create(createCrateDto) {
        return this.cratesService.create(createCrateDto);
    }
    findAll() {
        return this.cratesService.findAll();
    }
    findOne(id) {
        if (!isNaN(+id)) {
            return this.cratesService.findOne(+id);
        }
        return this.cratesService.findOneByQr(id);
    }
    update(id, updateCrateDto) {
        return this.cratesService.update(id, updateCrateDto);
    }
    move(id, cabinetId) {
        return this.cratesService.move(id, cabinetId);
    }
    remove(id) {
        return this.cratesService.remove(id);
    }
};
exports.CratesController = CratesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_crate_dto_1.CreateCrateDto]),
    __metadata("design:returntype", void 0)
], CratesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CratesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CratesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_crate_dto_1.UpdateCrateDto]),
    __metadata("design:returntype", void 0)
], CratesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/move'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('cabinetId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], CratesController.prototype, "move", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CratesController.prototype, "remove", null);
exports.CratesController = CratesController = __decorate([
    (0, common_1.Controller)('crates'),
    __metadata("design:paramtypes", [crates_service_1.CratesService])
], CratesController);
//# sourceMappingURL=crates.controller.js.map