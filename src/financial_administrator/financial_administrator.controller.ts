import { Controller, Get, Query } from '@nestjs/common';
import { FinancialAdministratorService } from './financial_administrator.service';

@Controller('financial-administrator')
export class FinancialAdministratorController {
  constructor(private readonly financialAdministratorService: FinancialAdministratorService) {}

  @Get('income-by-payment-method')
  getIncomeByPaymentMethod(@Query('period') period: string) {
    return this.financialAdministratorService.getIncomeByPaymentMethod(parseInt(period) || 6);
  }
}
