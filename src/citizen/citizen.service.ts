import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Citizen } from './entities/citizen.entity';
import { CreateCitizenDto } from './dto/create-citizen.dto';
import { UpdateCitizenDto } from './dto/update-citizen.dto';

@Injectable()
export class CitizenService {
  constructor(
    @InjectRepository(Citizen)
    private readonly citizenRepository: Repository<Citizen>,
  ) {}

  async create(createCitizenDto: CreateCitizenDto): Promise<Citizen> {
    const citizen = this.citizenRepository.create({
      person: { id: createCitizenDto.personId },
    });
    return await this.citizenRepository.save(citizen);
  }

  async findAll(): Promise<Citizen[]> {
    return await this.citizenRepository.find({ relations: ['person'] });
  }

  async findOne(id: number): Promise<Citizen> {
    const citizen = await this.citizenRepository.findOne({
      where: { id },
      relations: ['person'],
    });
    if (!citizen) {
      throw new NotFoundException(`Citizen with ID ${id} not found`);
    }
    return citizen;
  }

  async update(id: number, updateCitizenDto: UpdateCitizenDto): Promise<Citizen> {
    await this.findOne(id);
    if (updateCitizenDto.personId) {
      await this.citizenRepository.update(id, {
        person: { id: updateCitizenDto.personId },
      });
    }
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const citizen = await this.findOne(id);
    await this.citizenRepository.remove(citizen);
  }
}