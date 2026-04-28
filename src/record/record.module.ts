import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { ValidationRecord } from './entities/record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ValidationRecord])],
  controllers: [RecordController],
  providers: [RecordService],
})
export class RecordModule {}
