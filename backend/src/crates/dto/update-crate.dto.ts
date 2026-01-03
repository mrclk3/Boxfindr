import { PartialType } from '@nestjs/mapped-types';
import { CreateCrateDto } from './create-crate.dto';

export class UpdateCrateDto extends PartialType(CreateCrateDto) {}
