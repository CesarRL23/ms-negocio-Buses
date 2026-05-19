import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

import { Type } from 'class-transformer';

export class CreatePersonDto {
  @IsNotEmpty()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  roles?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  edad?: number;
}
