import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageGateway } from './message.gateway';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { PersonGroup } from '../person-group/entities/person-group.entity';
import { AnnouncementRecipient } from '../announcement/entities/announcement-recipient.entity';
import { Driver } from '../driver/entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessageRead, PersonGroup, AnnouncementRecipient, Driver])],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
  exports: [MessageService, MessageGateway],
})
export class MessageModule {}
