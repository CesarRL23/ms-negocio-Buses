import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
}
