import {
  IsString,IsNotEmpty,IsOptional,
} from 'class-validator';

export class CreatePersonDto {
  @IsNotEmpty()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  roles?: string[];
}
