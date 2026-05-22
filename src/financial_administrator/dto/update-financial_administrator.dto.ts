import { PartialType } from '@nestjs/mapped-types';
import { CreateFinancialAdministratorDto } from './create-financial_administrator.dto';

export class UpdateFinancialAdministratorDto extends PartialType(CreateFinancialAdministratorDto) {}
