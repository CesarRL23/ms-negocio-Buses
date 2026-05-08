import { Module } from '@nestjs/common';
import { IncidenteBusService } from './incidente_bus.service';
import { IncidenteBusController } from './incidente_bus.controller';
import { IncidenteBus } from './entities/incidente_bus.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from '../bus/entities/bus.entity';
import { Incidente } from '../incidente/entities/incidente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IncidenteBus, Bus, Incidente])],
  controllers: [IncidenteBusController],
  providers: [IncidenteBusService],
})
export class IncidenteBusModule {}
