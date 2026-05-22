import { Controller, Get, Query } from '@nestjs/common';
import { OperationsManagerService } from './operations_manager.service';

@Controller('operations-manager')
export class OperationsManagerController {
  constructor(private readonly operationsManagerService: OperationsManagerService) {}

  @Get('incident-trends')
  getIncidentTrends(
    @Query('period') period: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.operationsManagerService.getIncidentTrends(
      parseInt(period) || 6,
      companyId ? parseInt(companyId) : undefined,
    );
  }

  @Get('companies')
  getCompanies() {
    return this.operationsManagerService.getCompanies();
  }
}
