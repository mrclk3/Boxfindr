import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCabinetDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  location?: string;

  @IsString()
  @IsNotEmpty()
  qrCode: string;
}
