import { IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateQuantityDto {
  @Transform(({ value }) => +value)
  @IsInt()
  change: number;
}
