"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCabinetDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_cabinet_dto_1 = require("./create-cabinet.dto");
class UpdateCabinetDto extends (0, mapped_types_1.PartialType)(create_cabinet_dto_1.CreateCabinetDto) {
}
exports.UpdateCabinetDto = UpdateCabinetDto;
//# sourceMappingURL=update-cabinet.dto.js.map