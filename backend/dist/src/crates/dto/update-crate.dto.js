"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCrateDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_crate_dto_1 = require("./create-crate.dto");
class UpdateCrateDto extends (0, mapped_types_1.PartialType)(create_crate_dto_1.CreateCrateDto) {
}
exports.UpdateCrateDto = UpdateCrateDto;
//# sourceMappingURL=update-crate.dto.js.map