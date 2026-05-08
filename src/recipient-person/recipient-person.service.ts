import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecipientPersonDto } from './dto/create-recipient-person.dto';
import { UpdateRecipientPersonDto } from './dto/update-recipient-person.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RecipientPerson } from './entities/recipient-person.entity';
import { Repository } from 'typeorm';
import { Message } from '../message/entities/message.entity';
import { Person } from '../person/entities/person.entity';

@Injectable()
export class RecipientPersonService {
  constructor(
    @InjectRepository(RecipientPerson)
    private readonly recipientPersonRepository: Repository<RecipientPerson>,
  ) {}

  async create(createRecipientPersonDto: CreateRecipientPersonDto) {
    const { message_id, person_id } = createRecipientPersonDto;
    
    const newRecipient = this.recipientPersonRepository.create({
      message: { id: message_id } as Message,
      person: { id: person_id } as Person,
    });
    
    return await this.recipientPersonRepository.save(newRecipient);
  }

  async findAll() {
    return await this.recipientPersonRepository.find({
      relations: ['message', 'person'],
    });
  }

  async findOne(id: number) {
    const recipient = await this.recipientPersonRepository.findOne({
      where: { id },
      relations: ['message', 'person'],
    });
    if (!recipient) {
      throw new NotFoundException(`RecipientPerson with ID ${id} not found`);
    }
    return recipient;
  }

  async update(id: number, updateRecipientPersonDto: UpdateRecipientPersonDto) {
    const { message_id, person_id } = updateRecipientPersonDto;
    const recipient = await this.findOne(id);
    
    if (message_id) {
      recipient.message = { id: message_id } as Message;
    }
    if (person_id) {
      recipient.person = { id: person_id } as Person;
    }
    
    return await this.recipientPersonRepository.save(recipient);
  }

  async remove(id: number) {
    const recipient = await this.findOne(id);
    return await this.recipientPersonRepository.remove(recipient);
  }
}
