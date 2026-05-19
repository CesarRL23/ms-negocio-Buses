import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketintAnalystService } from './marketint-analyst.service';
import { MarketintAnalystController } from './marketint-analyst.controller';
import { MarketingAnalyst } from './entities/marketint-analyst.entity';
import { Company } from '../company/entities/company.entity';
import { Person } from '../person/entities/person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarketingAnalyst, Company, Person])],
  controllers: [MarketintAnalystController],
  providers: [MarketintAnalystService],
})
export class MarketintAnalystModule {}
