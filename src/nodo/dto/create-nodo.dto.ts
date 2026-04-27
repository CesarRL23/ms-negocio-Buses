import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateNodoDto {
  @IsNotEmpty()
  @IsNumber()
  whereaboutId?: number;

  @IsNotEmpty()
  @IsNumber()
  routeId?: number;

  @IsOptional()
  @IsNumber()
  orden?: number;
}
