import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Repository } from 'typeorm';
import { PersonGroup } from '../person-group/entities/person-group.entity';
import { Person } from '../person/entities/person.entity';
import { MessageGateway } from '../message/message.gateway';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(PersonGroup)
    private readonly personGroupRepository: Repository<PersonGroup>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly messageGateway: MessageGateway,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const { memberUserIds, creatorUserId, ...groupData } = createGroupDto;

    // Validate minimum 2 members besides creator
    const uniqueMembers = [...new Set(memberUserIds.filter((id) => id !== creatorUserId))];
    if (uniqueMembers.length < 2) {
      throw new BadRequestException('Se requieren al menos 2 miembros además del creador');
    }

    // Create the group
    const group = this.groupRepository.create({
      ...groupData,
      creatorUserId,
    });
    const savedGroup = await this.groupRepository.save(group);

    // Find creator person record
    const creatorPerson = await this.personRepository.findOne({
      where: { userId: creatorUserId },
    });

    if (creatorPerson) {
      // Add creator as admin
      const creatorMembership = this.personGroupRepository.create({
        person: creatorPerson,
        group: savedGroup,
        role: 'admin',
      });
      await this.personGroupRepository.save(creatorMembership);
    }

    // Add each member
    for (const memberUserId of uniqueMembers) {
      const memberPerson = await this.personRepository.findOne({
        where: { userId: memberUserId },
      });

      if (memberPerson) {
        const membership = this.personGroupRepository.create({
          person: memberPerson,
          group: savedGroup,
          role: 'member',
        });
        await this.personGroupRepository.save(membership);

        // Notify member via WebSocket
        this.messageGateway.notifyGroupAdded(memberUserId, {
          groupId: savedGroup.id,
          groupName: savedGroup.name,
          addedBy: creatorUserId,
        });
      }
    }

    // Return full group with relations
    return this.findOne(savedGroup.id);
  }

  async findAll() {
    return await this.groupRepository.find({
      relations: ['personGroups', 'personGroups.person'],
    });
  }

  async findOne(id: number) {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['personGroups', 'personGroups.person'],
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async findByUserId(userId: string) {
    // Find person by userId
    const person = await this.personRepository.findOne({
      where: { userId },
    });

    if (!person) {
      return [];
    }

    // Find all PersonGroup entries for this person
    const memberships = await this.personGroupRepository.find({
      where: { person: { id: person.id } },
      relations: ['group', 'group.personGroups', 'group.personGroups.person'],
    });

    return memberships.map((m) => ({
      ...m.group,
      myRole: m.role,
    }));
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.groupRepository.preload({
      id: id,
      ...updateGroupDto,
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return await this.groupRepository.save(group);
  }

  async remove(id: number) {
    const group = await this.findOne(id);
    return await this.groupRepository.remove(group);
  }
}
