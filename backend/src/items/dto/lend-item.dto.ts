import { IsString, IsNotEmpty } from 'class-validator';

export class LendItemDto {
  @IsString()
  @IsNotEmpty()
  lentTo: string;
}
