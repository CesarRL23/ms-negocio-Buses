import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyDriverService } from './company_driver.service';
import { CompanyDriverController } from './company_driver.controller';
import { CompanyDriver } from './entities/company_driver.entity';
import { Company } from '../company/entities/company.entity';
import { Driver } from '../driver/entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyDriver, Company, Driver])],
  controllers: [CompanyDriverController],
  providers: [CompanyDriverService],
})
export class CompanyDriverModule {}
