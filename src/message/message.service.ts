import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { PersonGroup } from '../person-group/entities/person-group.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(PersonGroup)
    private readonly personGroupRepository: Repository<PersonGroup>,
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

  async saveMessage(dto: CreateMessageDto): Promise<Message> {
    if (dto.receptor?.startsWith('group-')) {
      const groupId = Number(dto.receptor.replace('group-', ''));
      if (Number.isNaN(groupId)) {
        throw new ForbiddenException('Receptor de grupo inválido');
      }

      const membership = await this.personGroupRepository.findOne({
        where: {
          group: { id: groupId },
          person: { userId: dto.emisor },
        },
        relations: ['group', 'person'],
      });

      if (!membership) {
        throw new ForbiddenException('No estás autorizado para enviar mensajes a este grupo');
      }
    }

    const message = this.messageRepository.create({
      ...dto,
      fechaDeEnvio: dto.fechaDeEnvio || (new Date() as any),
      leido: false,
    });
    return await this.messageRepository.save(message);
  }

  async findGroupMessages(groupId: number, userId: string): Promise<Message[]> {
    const membership = await this.personGroupRepository.findOne({
      where: {
        group: { id: groupId },
        person: { userId },
      },
      relations: ['group', 'person'],
    });

    if (!membership) {
      throw new ForbiddenException('No perteneces a este grupo');
    }

    return await this.messageRepository.find({
      where: { receptor: `group-${groupId}` },
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
    return await this.messageRepository.save(message);
  }
}
