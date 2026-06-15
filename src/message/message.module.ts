import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageGateway } from './message.gateway';
import { Message } from './entities/message.entity';
import { PersonGroup } from '../person-group/entities/person-group.entity';
import { AnnouncementRecipient } from '../announcement/entities/announcement-recipient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, PersonGroup, AnnouncementRecipient])],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
  exports: [MessageService, MessageGateway],
})
export class MessageModule {}
