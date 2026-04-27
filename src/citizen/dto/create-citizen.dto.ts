import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCitizenDto {
  @IsNotEmpty()
  @IsNumber()
  personId?: number;

  
}