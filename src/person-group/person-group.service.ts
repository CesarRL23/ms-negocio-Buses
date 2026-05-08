import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonGroupDto } from './dto/create-person-group.dto';
import { UpdatePersonGroupDto } from './dto/update-person-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonGroup } from './entities/person-group.entity';
import { Repository } from 'typeorm';
import { Person } from '../person/entities/person.entity';
import { Group } from '../group/entities/group.entity';

@Injectable()
export class PersonGroupService {
  constructor(
    @InjectRepository(PersonGroup)
    private readonly personGroupRepository: Repository<PersonGroup>,
  ) {}

  async create(createPersonGroupDto: CreatePersonGroupDto) {
    const { person_id, group_id } = createPersonGroupDto;
    const personGroup = this.personGroupRepository.create({
      person: { id: person_id } as Person,
      group: { id: group_id } as Group,
    });
    return await this.personGroupRepository.save(personGroup);
  }

  async findAll() {
    return await this.personGroupRepository.find({
      relations: ['person', 'group'],
    });
  }

  async findOne(id: number) {
    const personGroup = await this.personGroupRepository.findOne({
      where: { id },
      relations: ['person', 'group'],
    });
    if (!personGroup) {
      throw new NotFoundException(`PersonGroup with ID ${id} not found`);
    }
    return personGroup;
  }

  async update(id: number, updatePersonGroupDto: UpdatePersonGroupDto) {
    const { person_id, group_id } = updatePersonGroupDto;
    const personGroup = await this.findOne(id);
    
    if (person_id) {
      personGroup.person = { id: person_id } as Person;
    }
    if (group_id) {
      personGroup.group = { id: group_id } as Group;
    }
    
    return await this.personGroupRepository.save(personGroup);
  }

  async remove(id: number) {
    const personGroup = await this.findOne(id);
    return await this.personGroupRepository.remove(personGroup);
  }
}
