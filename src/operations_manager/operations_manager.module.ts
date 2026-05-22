import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationsManagerService } from './operations_manager.service';
import { OperationsManagerController } from './operations_manager.controller';
import { Incidente } from '../incidente/entities/incidente.entity';
import { Company } from '../company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Incidente, Company])],
  controllers: [OperationsManagerController],
  providers: [OperationsManagerService],
})
export class OperationsManagerModule {}
