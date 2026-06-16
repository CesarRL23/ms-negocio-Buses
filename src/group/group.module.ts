import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { PersonGroup } from '../person-group/entities/person-group.entity';
import { Person } from '../person/entities/person.entity';
import { GroupMembershipLog } from './entities/group-membership-log.entity';
import { GroupBan } from './entities/group-ban.entity';
import { Message } from '../message/entities/message.entity';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, PersonGroup, Person, GroupMembershipLog, GroupBan, Message]),
    MessageModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
