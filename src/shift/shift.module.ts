import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { Shift } from './entities/shift.entity';
import { Driver } from '../driver/entities/driver.entity';
import { Bus } from '../bus/entities/bus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shift, Driver, Bus]) 
  ],
  controllers: [ShiftController],
  providers: [ShiftService],
})
export class ShiftModule {}