
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Max, Min } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  contenido?: string;

  @IsOptional()
  @IsDateString()
  fechaDeEnvio?: Date;

  @IsNotEmpty()
  @IsString()
  emisor?: string;

  @IsOptional()
  @IsString()
  receptor?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud?: number;
}
