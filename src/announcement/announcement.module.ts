import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { Announcement } from './entities/announcement.entity';
import { AnnouncementRecipient } from './entities/announcement-recipient.entity';
import { Citizen } from '../citizen/entities/citizen.entity';
import { Address } from '../address/entities/address.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement, AnnouncementRecipient, Citizen, Address, Ticket]),
    MessageModule,
  ],
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
})
export class AnnouncementModule {}
