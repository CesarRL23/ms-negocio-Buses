import { Module } from '@nestjs/common';
import { BusService } from './bus.service';
import { BusController } from './bus.controller';
import { Bus } from './entities/bus.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gps } from 'src/gps/entities/gps.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bus,Gps])],
  controllers: [BusController],
  providers: [BusService],
})
export class BusModule {}
