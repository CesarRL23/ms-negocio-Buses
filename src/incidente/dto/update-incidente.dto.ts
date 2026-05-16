import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';

export enum IncidenteTipo {
  MECANICO = 'mecanico',
  ACCIDENTE = 'accidente',
  RETRASO = 'retraso',
  OTRO = 'otro',
}

export enum IncidenteGravedad {
  BAJO = 'bajo',
  MEDIO = 'medio',
  ALTO = 'alto',
  CRITICO = 'critico',
}

export class UpdateIncidenteDto {
  @IsOptional()
  @IsEnum(IncidenteTipo)
  tipo?: IncidenteTipo;

  @IsOptional()
  @IsEnum(IncidenteGravedad)
  gravedad?: IncidenteGravedad;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  tipo_otro?: string;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;
}
