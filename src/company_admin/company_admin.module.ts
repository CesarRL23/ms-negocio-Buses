import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyAdminService } from './company_admin.service';
import { CompanyAdminController } from './company_admin.controller';
import { CompanyAdmin } from './entities/company_admin.entity';
import { Company } from '../company/entities/company.entity';
import { Person } from '../person/entities/person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyAdmin, Company, Person])],
  controllers: [CompanyAdminController],
  providers: [CompanyAdminService],
})
export class CompanyAdminModule {}
