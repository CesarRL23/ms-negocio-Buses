import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCompanyAdminDto {
  @IsNotEmpty()
  @IsNumber()
  personId?: number;

  @IsNotEmpty()
  @IsNumber()
  companyId?: number;
}
