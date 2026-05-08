
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  contenido?: string;

  @IsNotEmpty()
  @IsDateString()
  fechaDeEnvio?: Date;

  @IsNotEmpty()
  @IsString()
  emisor?: string;
}
