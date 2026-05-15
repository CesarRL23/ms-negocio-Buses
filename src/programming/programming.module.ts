import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgrammingService } from './programming.service';
import { ProgrammingController } from './programming.controller';
import { Programming } from './entities/programming.entity';

import { Shift } from '../shift/entities/shift.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Programming, Shift])],
  controllers: [ProgrammingController],
  providers: [ProgrammingService],
  exports: [ProgrammingService],
})
export class ProgrammingModule {}
