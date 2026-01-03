import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // Handles form-data string to number conversion if handled globally or use Transform?
  // Since we might use Multer (Multipart), fields come as strings usually unless validated properly.
  @Transform(({ value }) => +value)
  @IsInt()
  @Min(0)
  quantity: number;

  @Transform(({ value }) => +value)
  @IsInt()
  @Min(0)
  minQuantity: number;

  @Transform(({ value }) => +value)
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @Transform(({ value }) => +value)
  @IsInt()
  crateId: number;
}
