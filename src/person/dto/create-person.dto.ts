import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreatePersonDto {
  @IsNotEmpty()
  @IsString()
  nombre?: string;

  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password?: string;
}
