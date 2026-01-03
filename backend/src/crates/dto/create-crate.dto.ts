import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateCrateDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsNotEmpty()
  qrCode: string;

  @IsInt()
  @IsNotEmpty()
  cabinetId: number;

  @IsInt()
  @IsOptional()
  categoryId?: number;
}
