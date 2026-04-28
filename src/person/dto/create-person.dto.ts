import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsNumber } from 'class-validator';

export class CreatePersonDto {
  @IsNotEmpty()
  @IsString()
  nombre?: string;


  @IsOptional()
  @IsString()
  userId?: string;
}
