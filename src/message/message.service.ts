import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { PersonGroup } from '../person-group/entities/person-group.entity';
import { AnnouncementRecipient } from '../announcement/entities/announcement-recipient.entity';
import { Announcement } from '../announcement/entities/announcement.entity';
import { SYSTEM_ANNOUNCEMENTS_SENDER_ID } from '../announcement/constants';
import { Driver } from '../driver/entities/driver.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageRead)
    private readonly messageReadRepository: Repository<MessageRead>,
    @InjectRepository(PersonGroup)
    private readonly personGroupRepository: Repository<PersonGroup>,
    @InjectRepository(AnnouncementRecipient)
    private readonly recipientRepository: Repository<AnnouncementRecipient>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) { }

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    return await this.messageRepository.save(message);
  }

  async findAll(): Promise<Message[]> {
    return await this.messageRepository.find();
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto): Promise<Message> {
    await this.findOne(id);
    await this.messageRepository.update(id, updateMessageDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const message = await this.findOne(id);
    await this.messageRepository.remove(message);
  }

  private parseGroupId(receptor?: string): number {
    if (!receptor?.startsWith('group-')) {
      throw new ForbiddenException('Este mensaje no pertenece a un grupo');
    }
    const groupId = Number(receptor.replace('group-', ''));
    if (Number.isNaN(groupId)) {
      throw new ForbiddenException('Receptor de grupo inválido');
    }
    return groupId;
  }

  private async getGroupMembership(groupId: number, userId: string): Promise<PersonGroup | null> {
    return await this.personGroupRepository.findOne({
      where: {
        group: { id: groupId },
        person: { userId },
      },
      relations: ['group', 'person'],
    });
  }

  async saveMessage(dto: CreateMessageDto): Promise<Message> {
    let senderRole: 'citizen' | 'driver' = 'citizen';

    if (dto.receptor?.startsWith('group-')) {
      const groupId = this.parseGroupId(dto.receptor);

      const membership = await this.getGroupMembership(groupId, dto.emisor as string);
      if (!membership) {
        throw new ForbiddenException('No estás autorizado para enviar mensajes a este grupo');
      }

      const driver = await this.driverRepository.findOne({
        where: { person: { userId: dto.emisor } },
        relations: ['person'],
      });

      if (dto.senderInterface) {
        // El cliente indica desde qué interfaz envía; solo se acepta 'driver'
        // si el usuario realmente tiene registro de conductor.
        senderRole = dto.senderInterface === 'driver' && driver ? 'driver' : 'citizen';
      } else if (driver) {
        senderRole = 'driver';
      }
    }

    const { senderInterface: _senderInterface, ...messageData } = dto;
    const message = this.messageRepository.create({
      ...messageData,
      fechaDeEnvio: dto.fechaDeEnvio || (new Date() as any),
      leido: false,
      senderRole,
    });
    return await this.messageRepository.save(message);
  }

  async findGroupMessages(groupId: number, userId: string): Promise<Message[]> {
    const membership = await this.getGroupMembership(groupId, userId);

    if (!membership) {
      throw new ForbiddenException('No perteneces a este grupo');
    }

    return await this.messageRepository.find({
      where: { receptor: `group-${groupId}`, deletedAt: IsNull() },
      order: { fechaDeEnvio: 'ASC' },
    });
  }

  async findSent(userId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { emisor: userId },
      order: { fechaDeEnvio: 'DESC' },
    });
  }

  async findReceived(userId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { receptor: userId },
      order: { fechaDeEnvio: 'DESC' },
    });
  }

  async markAsRead(id: number, callerUserId: string): Promise<Message> {
    const message = await this.findOne(id);
    if (message.receptor !== callerUserId) {
      throw new ForbiddenException('Solo el destinatario puede marcar como leído');
    }
    message.leido = true;
    message.fechaLectura = new Date();
    const saved = await this.messageRepository.save(message);

    if (saved.messageType === 'ANNOUNCEMENT' && saved.announcementId) {
      await this.recipientRepository.update(
        { announcement: { id: saved.announcementId }, userId: callerUserId },
        { read: true, readAt: new Date() },
      );
    }

    return saved;
  }

  async markGroupMessageRead(messageId: number, userId: string): Promise<MessageRead> {
    const message = await this.findOne(messageId);
    const groupId = this.parseGroupId(message.receptor);

    const membership = await this.getGroupMembership(groupId, userId);
    if (!membership) {
      throw new ForbiddenException('No perteneces a este grupo');
    }

    let read = await this.messageReadRepository.findOne({
      where: { message: { id: messageId }, userId },
      relations: ['message'],
    });

    if (!read) {
      read = this.messageReadRepository.create({
        message,
        userId,
        readAt: new Date(),
      });
      read = await this.messageReadRepository.save(read);
    }

    return read;
  }

  async getGroupMessageReadStatus(
    messageId: number,
    callerUserId: string,
  ): Promise<{ userId: string; nombre: string; read: boolean; readAt?: Date }[]> {
    const message = await this.findOne(messageId);
    const groupId = this.parseGroupId(message.receptor);

    const callerMembership = await this.getGroupMembership(groupId, callerUserId);
    if (!callerMembership) {
      throw new ForbiddenException('No perteneces a este grupo');
    }

    const members = await this.personGroupRepository.find({
      where: { group: { id: groupId } },
      relations: ['person'],
    });

    const reads = await this.messageReadRepository.find({
      where: { message: { id: messageId } },
    });

    return members
      .filter((m) => m.person?.userId && m.person.userId !== message.emisor)
      .map((m) => {
        const read = reads.find((r) => r.userId === m.person.userId);
        return {
          userId: m.person.userId as string,
          nombre: m.person.nombre as string,
          read: !!read,
          readAt: read?.readAt,
        };
      });
  }

  async removeGroupMessage(messageId: number, callerUserId: string): Promise<Message> {
    const message = await this.findOne(messageId);
    const groupId = this.parseGroupId(message.receptor);

    const membership = await this.getGroupMembership(groupId, callerUserId);
    if (!membership || membership.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador del grupo puede eliminar mensajes');
    }

    message.deletedAt = new Date();
    message.deletedBy = callerUserId;
    return await this.messageRepository.save(message);
  }

  async createAnnouncementMessages(announcement: Announcement, userIds: string[]): Promise<Message[]> {
    const messages = userIds.map((userId) =>
      this.messageRepository.create({
        emisor: SYSTEM_ANNOUNCEMENTS_SENDER_ID,
        receptor: userId,
        contenido: announcement.message,
        fechaDeEnvio: new Date(),
        leido: false,
        messageType: 'ANNOUNCEMENT',
        announcementId: announcement.id,
        isUrgent: !!announcement.isUrgent,
      }),
    );
    return this.messageRepository.save(messages);
  }
}
