import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, MaxLength } from 'class-validator';

export class CreateIncidenteBusDto {
  @IsNotEmpty()
  @IsNumber()
  incidenteId: number;

  @IsNotEmpty()
  @IsNumber()
  busId: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsArray()
  @MaxLength(5, {
    message: 'Máximo 5 fotos permitidas por incidente',
  })
  fotoUrls?: string[];
}
