import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

export enum IncidenteTipo {
  MECANICO = 'mecanico',
  ACCIDENTE = 'accidente',
  RETRASO = 'retraso',
  PASAJEROS = 'pasajeros',
  OTRO = 'otro',
}

export enum IncidenteGravedad {
  BAJO = 'bajo',
  MEDIO = 'medio',
  ALTO = 'alto',
  CRITICO = 'critico',
}

export class CreateIncidenteReportDto {
  @IsNotEmpty()
  @IsEnum(IncidenteTipo)
  tipo: IncidenteTipo;

  @IsNotEmpty()
  @IsEnum(IncidenteGravedad)
  gravedad: IncidenteGravedad;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  descripcion: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tipo_otro?: string; // Para cuando tipo === 'otro'

  @IsOptional()
  @IsArray()
  @MaxLength(5, { message: 'Máximo 5 fotos permitidas' })
  fotoUrls?: string[]; // URLs de fotos, máximo 5

  @IsOptional()
  shiftId?: number; // Si viene vacío, usar turno activo
}
