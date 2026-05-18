import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddComentarioDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  autor: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  texto: string;
}
