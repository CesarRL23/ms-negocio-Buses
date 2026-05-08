import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const group = this.groupRepository.create(createGroupDto);
    return await this.groupRepository.save(group);
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
