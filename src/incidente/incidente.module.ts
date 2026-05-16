import { Module } from '@nestjs/common';
import { IncidenteService } from './incidente.service';
import { IncidenteController } from './incidente.controller';
import { Incidente } from './entities/incidente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftModule } from '../shift/shift.module';
import { IncidenteBusModule } from '../incidente_bus/incidente_bus.module';

@Module({
  imports: [TypeOrmModule.forFeature([Incidente]), ShiftModule, IncidenteBusModule],
  controllers: [IncidenteController],
  providers: [IncidenteService],
})
export class IncidenteModule {}
