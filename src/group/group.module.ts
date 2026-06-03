import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { PersonGroup } from '../person-group/entities/person-group.entity';
import { Person } from '../person/entities/person.entity';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, PersonGroup, Person]),
    MessageModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
