import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidenteBus } from './entities/incidente_bus.entity';
import { CreateIncidenteBusDto } from './dto/create-incidente-bus.dto';
import { UpdateIncidenteBusDto } from './dto/update-incidente-bus.dto';
import { Bus } from '../bus/entities/bus.entity';
import { Incidente } from '../incidente/entities/incidente.entity';

@Injectable()
export class IncidenteBusService {
  constructor(
    @InjectRepository(IncidenteBus)
    private readonly incidenteBusRepository: Repository<IncidenteBus>,
  ) {}

  async create(createDto: CreateIncidenteBusDto): Promise<IncidenteBus> {
    const { incidenteId, busId, ...rest } = createDto as any;
    const ib: IncidenteBus = this.incidenteBusRepository.create({
      ...rest,
      bus: { id: busId } as Bus,
      incidente: { id: incidenteId } as Incidente,
    } as any) as IncidenteBus;
    return this.incidenteBusRepository.save(ib as IncidenteBus);
  }

  async findAll(): Promise<IncidenteBus[]> {
    return this.incidenteBusRepository.find({
      relations: ['fotos', 'incidente'],
    });
  }

  async findOne(id: number): Promise<IncidenteBus> {
    const ib = await this.incidenteBusRepository.findOne({
      where: { id },
      relations: ['fotos', 'incidente'],
    });
    if (!ib)
      throw new NotFoundException(`IncidenteBus with ID ${id} not found`);
    return ib;
  }

  async update(
    id: number,
    updateDto: UpdateIncidenteBusDto,
  ): Promise<IncidenteBus> {
    await this.findOne(id);
    await this.incidenteBusRepository.update(id, updateDto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const ib = await this.findOne(id);
    await this.incidenteBusRepository.remove(ib);
  }
}
