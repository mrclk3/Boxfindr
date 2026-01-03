import { IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class TransferItemDto {
  @Transform(({ value }) => +value)
  @IsInt()
  targetCrateId: number;
}
