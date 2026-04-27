import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgrammingService } from './programming.service';
import { ProgrammingController } from './programming.controller';
import { Programming } from './entities/programming.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Programming])],
  controllers: [ProgrammingController],
  providers: [ProgrammingService],
  exports: [ProgrammingService],
})
export class ProgrammingModule {}
