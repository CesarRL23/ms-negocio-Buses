import { Module } from '@nestjs/common';
import { PersonGroupService } from './person-group.service';
import { PersonGroupController } from './person-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonGroup } from './entities/person-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonGroup])],
  controllers: [PersonGroupController],
  providers: [PersonGroupService],
})
export class PersonGroupModule {}
