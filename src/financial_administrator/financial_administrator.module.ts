import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialAdministratorService } from './financial_administrator.service';
import { FinancialAdministratorController } from './financial_administrator.controller';
import { Ticket } from '../ticket/entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [FinancialAdministratorController],
  providers: [FinancialAdministratorService],
})
export class FinancialAdministratorModule {}
