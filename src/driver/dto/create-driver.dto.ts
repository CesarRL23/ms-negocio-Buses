import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDriverDto {
  @IsNotEmpty()
  @IsNumber()
  personId?: number;
}
