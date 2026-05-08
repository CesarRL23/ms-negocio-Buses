import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePersonGroupDto {
  @IsNotEmpty()
  @IsNumber()
  person_id: number;

  @IsNotEmpty()
  @IsNumber()
  group_id: number;
}
