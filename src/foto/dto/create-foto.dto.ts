import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateFotoDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsNumber()
  incidenteBusId: number;
}
