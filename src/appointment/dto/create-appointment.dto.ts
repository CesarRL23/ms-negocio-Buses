import {
  IsEnum,
  IsString,
  IsEmail,
  MaxLength,
  Matches,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { AttentionType, ConsultationType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsOptional()
  @IsNumber()
  citizenId?: number;

  @IsOptional()
  @IsString()
  citizenUserId?: string;

  @IsEmail()
  citizenEmail: string;

  @IsString()
  citizenName: string;

  /** Format: YYYY-MM-DD */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fecha debe tener formato YYYY-MM-DD' })
  fecha: string;

  /** Format: HH:MM (24h) */
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'hora debe tener formato HH:MM' })
  hora: string;

  @IsEnum(AttentionType)
  tipoAtencion: AttentionType;

  @IsEnum(ConsultationType)
  tipoConsulta: ConsultationType;

  @IsString()
  @MaxLength(300)
  motivo: string;
}
