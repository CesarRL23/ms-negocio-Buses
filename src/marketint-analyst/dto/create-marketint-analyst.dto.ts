import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateMarketintAnalystDto {
  @IsNotEmpty()
  @IsNumber()
  personId?: number;

  @IsOptional()
  @IsNumber()
  companyId?: number;
}
