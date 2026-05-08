import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateIncidenteDto {
  @IsNotEmpty()
  @IsDateString()
  timestamp: string;

  @IsNotEmpty()
  @IsString()
  tipo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
