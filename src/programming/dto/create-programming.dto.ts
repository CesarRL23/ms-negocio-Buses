import {
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProgrammingDto {
  @IsNotEmpty()
  @IsNumber()
  routeId?: number;

  @IsNotEmpty()
  @IsNumber()
  busId?: number;

  @IsNotEmpty()
  @IsNumber()
  driverId?: number;

  @IsNotEmpty()
  @IsString()
  fecha?: string;

  @IsOptional()
  @IsString()
  horaSalida?: string;

  @IsOptional()
  @IsString()
  horaLlegada?: string;

  @IsOptional()
  @IsNumber()
  margenTolerancia?: number;

  @IsOptional()
  @IsBoolean()
  esRecurrente?: boolean;

  @IsOptional()
  @IsString()
  tipoRecurrencia?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
