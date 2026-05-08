import { Module } from '@nestjs/common';
import { IncidenteService } from './incidente.service';
import { IncidenteController } from './incidente.controller';
import { Incidente } from './entities/incidente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Incidente])],
  controllers: [IncidenteController],
  providers: [IncidenteService],
})
export class IncidenteModule {}
