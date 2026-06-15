import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { LessThanOrEqual, Repository } from 'typeorm';
import axios from 'axios';
import { Announcement } from './entities/announcement.entity';
import { AnnouncementRecipient } from './entities/announcement-recipient.entity';
import { Citizen } from '../citizen/entities/citizen.entity';
import { Address } from '../address/entities/address.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { MessageGateway } from '../message/message.gateway';
import { MessageService } from '../message/message.service';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    @InjectRepository(AnnouncementRecipient)
    private readonly recipientRepository: Repository<AnnouncementRecipient>,
    @InjectRepository(Citizen)
    private readonly citizenRepository: Repository<Citizen>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly messageGateway: MessageGateway,
    private readonly messageService: MessageService,
  ) {}

  async getAllUserIdsFromSecurity(token?: string): Promise<string[]> {
    const { data } = await axios.get<{ id: string }[]>(`${process.env.MS_SECURITY}/users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return data.map((u) => u.id).filter(Boolean);
  }

  async resolveRecipientUserIds(scope: string, scopeValue?: string, token?: string): Promise<string[]> {
    if (scope === 'ROUTE') {
      if (!scopeValue) return [];
      const rows = await this.ticketRepository
        .createQueryBuilder('ticket')
        .innerJoin('ticket.programming', 'programming')
        .innerJoin('programming.route', 'route')
        .innerJoin('ticket.citizenPaymentMethod', 'cpm')
        .innerJoin('cpm.citizen', 'citizen')
        .innerJoin('citizen.person', 'person')
        .where('route.id = :routeId', { routeId: scopeValue })
        .select('DISTINCT person.userId', 'userId')
        .getRawMany();

      return rows.map((row) => row.userId).filter(Boolean);
    }

    if (scope === 'ZONE') {
      if (!scopeValue) return [];
      const citizens = await this.citizenRepository.find({
        where: { address: { city: scopeValue } },
        relations: ['person', 'address'],
      });
      return citizens.map((citizen) => citizen.person?.userId).filter((id): id is string => !!id);
    }

    // ALL: todos los usuarios registrados en ms-security (Mongo)
    return this.getAllUserIdsFromSecurity(token);
  }

  async getRecipientCount(scope: string, scopeValue?: string, token?: string): Promise<number> {
    const userIds = await this.resolveRecipientUserIds(scope, scopeValue, token);
    return userIds.length;
  }

  async getZoneOptions(): Promise<string[]> {
    const rows = await this.addressRepository
      .createQueryBuilder('address')
      .select('DISTINCT address.city', 'city')
      .where('address.city IS NOT NULL')
      .getRawMany();

    return rows.map((row) => row.city).filter(Boolean);
  }

  async create(dto: CreateAnnouncementDto, senderUserId: string, token?: string): Promise<Announcement> {
    const scheduledFor = dto.scheduledFor ? new Date(dto.scheduledFor) : undefined;
    const isScheduledForFuture = !!scheduledFor && scheduledFor.getTime() > Date.now();

    const announcement = await this.announcementRepository.save(
      this.announcementRepository.create({
        title: dto.title,
        message: dto.message,
        scope: dto.scope,
        scopeValue: dto.scopeValue,
        isUrgent: dto.isUrgent ?? false,
        senderUserId,
        scheduledFor,
        status: 'SCHEDULED',
      }),
    );

    const userIds = await this.resolveRecipientUserIds(announcement.scope!, announcement.scopeValue, token);
    if (userIds.length > 0) {
      const recipients = userIds.map((userId) =>
        this.recipientRepository.create({ announcement, userId }),
      );
      await this.recipientRepository.save(recipients);
    }
    announcement.recipientCount = userIds.length;
    await this.announcementRepository.save(announcement);

    if (!isScheduledForFuture) {
      return this.send(announcement);
    }

    return announcement;
  }

  async send(announcement: Announcement): Promise<Announcement> {
    const recipients = await this.recipientRepository.find({
      where: { announcement: { id: announcement.id } },
    });
    const userIds = recipients.map((recipient) => recipient.userId!).filter(Boolean);

    if (userIds.length > 0) {
      const connectedUserIds = new Set(this.messageGateway.getConnectedUserIds(userIds));
      if (connectedUserIds.size > 0) {
        await this.recipientRepository
          .createQueryBuilder()
          .update(AnnouncementRecipient)
          .set({ delivered: true, deliveredAt: new Date() })
          .where('announcementId = :announcementId', { announcementId: announcement.id })
          .andWhere('userId IN (:...userIds)', { userIds: Array.from(connectedUserIds) })
          .execute();
      }

      this.messageGateway.broadcastAnnouncement(
        userIds,
        {
          id: announcement.id!,
          title: announcement.title!,
          message: announcement.message!,
          isUrgent: !!announcement.isUrgent,
          createdAt: announcement.createdAt!,
        },
        !!announcement.isUrgent,
      );

      const messages = await this.messageService.createAnnouncementMessages(announcement, userIds);
      this.messageGateway.broadcastNewMessages(messages);
    }

    announcement.status = 'SENT';
    announcement.sentAt = new Date();
    announcement.recipientCount = userIds.length;
    return this.announcementRepository.save(announcement);
  }

  @Cron('*/1 * * * *')
  async processScheduled(): Promise<void> {
    const due = await this.announcementRepository.find({
      where: { status: 'SCHEDULED', scheduledFor: LessThanOrEqual(new Date()) },
    });

    for (const announcement of due) {
      await this.send(announcement);
    }
  }

  async markRead(announcementId: number, userId: string): Promise<void> {
    await this.recipientRepository.update(
      { announcement: { id: announcementId }, userId },
      { read: true, readAt: new Date() },
    );
  }

  async getStats(announcementId: number) {
    const announcement = await this.announcementRepository.findOne({ where: { id: announcementId } });
    if (!announcement) throw new NotFoundException(`Anuncio #${announcementId} no encontrado`);

    const total = await this.recipientRepository.count({ where: { announcement: { id: announcementId } } });
    const delivered = await this.recipientRepository.count({
      where: { announcement: { id: announcementId }, delivered: true },
    });
    const read = await this.recipientRepository.count({
      where: { announcement: { id: announcementId }, read: true },
    });

    return {
      total,
      delivered,
      read,
      deliveredPct: total === 0 ? 0 : Math.round((delivered / total) * 100),
      readPct: total === 0 ? 0 : Math.round((read / total) * 100),
    };
  }

  async findAllForAdmin(): Promise<Announcement[]> {
    return this.announcementRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findForUser(userId: string) {
    const recipients = await this.recipientRepository.find({
      where: { userId },
      relations: ['announcement'],
      order: { id: 'DESC' },
    });

    return recipients.map((recipient) => ({
      ...recipient.announcement,
      delivered: recipient.delivered,
      read: recipient.read,
      readAt: recipient.readAt,
    }));
  }
}
