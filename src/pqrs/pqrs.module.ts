import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pqrs } from './entities/pqrs.entity';
import { PqrsService } from './pqrs.service';
import { PqrsController } from './pqrs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pqrs])],
  controllers: [PqrsController],
  providers: [PqrsService],
})
export class PqrsModule {}
