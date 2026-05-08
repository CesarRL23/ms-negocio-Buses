import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Foto } from './entities/foto.entity';
import { CreateFotoDto } from './dto/create-foto.dto';
import { UpdateFotoDto } from './dto/update-foto.dto';
import { IncidenteBus } from '../incidente_bus/entities/incidente_bus.entity';

@Injectable()
export class FotoService {
  constructor(
    @InjectRepository(Foto)
    private readonly fotoRepository: Repository<Foto>,
  ) {}

  async create(dto: CreateFotoDto): Promise<Foto> {
    const { incidenteBusId, ...rest } = dto as any;
    const foto: Foto = this.fotoRepository.create({
      ...rest,
      incidenteBus: { id: incidenteBusId } as IncidenteBus,
    } as any) as Foto;
    return this.fotoRepository.save(foto as Foto);
  }

  async findAll(): Promise<Foto[]> {
    return this.fotoRepository.find({ relations: ['incidenteBus'] });
  }

  async findOne(id: number): Promise<Foto> {
    const f = await this.fotoRepository.findOne({
      where: { id },
      relations: ['incidenteBus'],
    });
    if (!f) throw new NotFoundException(`Foto with ID ${id} not found`);
    return f;
  }

  async update(id: number, dto: UpdateFotoDto): Promise<Foto> {
    await this.findOne(id);
    await this.fotoRepository.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const f = await this.findOne(id);
    await this.fotoRepository.remove(f);
  }
}
