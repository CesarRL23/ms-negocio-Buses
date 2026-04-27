import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateBusDto {
  @IsNotEmpty()
  @IsString()
  placa?: string;

  @IsNotEmpty()
  @IsString()
  modelo?: string;

  @IsNotEmpty()
  @IsNumber()
  capacidad?: number;

  @IsNotEmpty()
  @IsString()
  marca?: string;

  @IsNotEmpty()
  @IsString()
  estado?: string;
}
