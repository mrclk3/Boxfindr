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
exports.CabinetsController = void 0;
const common_1 = require("@nestjs/common");
const cabinets_service_1 = require("./cabinets.service");
const create_cabinet_dto_1 = require("./dto/create-cabinet.dto");
const update_cabinet_dto_1 = require("./dto/update-cabinet.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CabinetsController = class CabinetsController {
    cabinetsService;
    constructor(cabinetsService) {
        this.cabinetsService = cabinetsService;
    }
    create(createCabinetDto) {
        return this.cabinetsService.create(createCabinetDto);
    }
    findAll(includeCrates) {
        return this.cabinetsService.findAll(includeCrates === 'true');
    }
    findOne(id) {
        return this.cabinetsService.findOne(id);
    }
    update(id, updateCabinetDto) {
        return this.cabinetsService.update(id, updateCabinetDto);
    }
    remove(id) {
        return this.cabinetsService.remove(id);
    }
};
exports.CabinetsController = CabinetsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cabinet_dto_1.CreateCabinetDto]),
    __metadata("design:returntype", void 0)
], CabinetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('includeCrates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CabinetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CabinetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_cabinet_dto_1.UpdateCabinetDto]),
    __metadata("design:returntype", void 0)
], CabinetsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CabinetsController.prototype, "remove", null);
exports.CabinetsController = CabinetsController = __decorate([
    (0, common_1.Controller)('cabinets'),
    __metadata("design:paramtypes", [cabinets_service_1.CabinetsService])
], CabinetsController);
//# sourceMappingURL=cabinets.controller.js.map