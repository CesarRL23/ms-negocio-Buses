import { IsNotEmpty, IsNumber, IsDate, IsString, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProgrammingDto {
  @IsNotEmpty()
  @IsNumber()
  routeId?: number;

  @IsNotEmpty()
  @IsNumber()
  busId?: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaInicio?: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaFin?: Date;

  @IsNotEmpty()
  @IsString()
  horaSalida?: string;

  @IsNotEmpty()
  @IsString()
  horaLlegada?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
