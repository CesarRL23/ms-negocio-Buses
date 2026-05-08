import { Module } from '@nestjs/common';
import { FotoService } from './foto.service';
import { FotoController } from './foto.controller';
import { Foto } from './entities/foto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidenteBus } from '../incidente_bus/entities/incidente_bus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Foto, IncidenteBus])],
  controllers: [FotoController],
  providers: [FotoService],
})
export class FotoModule {}
