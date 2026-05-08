import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incidente } from './entities/incidente.entity';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';

@Injectable()
export class IncidenteService {
  constructor(
    @InjectRepository(Incidente)
    private readonly incidenteRepository: Repository<Incidente>,
  ) {}

  async create(createIncidenteDto: CreateIncidenteDto): Promise<Incidente> {
    const incidente = this.incidenteRepository.create({
      ...createIncidenteDto,
      timestamp: new Date(createIncidenteDto.timestamp as string),
    } as any) as Incidente;
    return await this.incidenteRepository.save(incidente as Incidente);
  }

  async findAll(): Promise<Incidente[]> {
    return this.incidenteRepository.find({ relations: ['incidenteBuses'] });
  }

  async findOne(id: number): Promise<Incidente> {
    const incidente = await this.incidenteRepository.findOne({
      where: { id },
      relations: ['incidenteBuses'],
    });
    if (!incidente) {
      throw new NotFoundException(`Incidente with ID ${id} not found`);
    }
    return incidente;
  }

  async update(
    id: number,
    updateIncidenteDto: UpdateIncidenteDto,
  ): Promise<Incidente> {
    await this.findOne(id);
    await this.incidenteRepository.update(id, updateIncidenteDto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const incidente = await this.findOne(id);
    await this.incidenteRepository.remove(incidente);
  }
}
