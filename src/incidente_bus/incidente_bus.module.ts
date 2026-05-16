import { Module } from '@nestjs/common';
import { IncidenteBusService } from './incidente_bus.service';
import { IncidenteBusController } from './incidente_bus.controller';
import { IncidenteBus } from './entities/incidente_bus.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from '../bus/entities/bus.entity';
import { Incidente } from '../incidente/entities/incidente.entity';
import { Foto } from '../foto/entities/foto.entity';
import { FotoModule } from '../foto/foto.module';

@Module({
  imports: [TypeOrmModule.forFeature([IncidenteBus, Bus, Incidente, Foto]), FotoModule],
  controllers: [IncidenteBusController],
  providers: [IncidenteBusService],
  exports: [IncidenteBusService],
})
export class IncidenteBusModule {}
