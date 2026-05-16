import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidenteBus } from './entities/incidente_bus.entity';
import { CreateIncidenteBusDto } from './dto/create-incidente-bus.dto';
import { UpdateIncidenteBusDto } from './dto/update-incidente-bus.dto';
import { Bus } from '../bus/entities/bus.entity';
import { Incidente } from '../incidente/entities/incidente.entity';
import { Foto } from '../foto/entities/foto.entity';

@Injectable()
export class IncidenteBusService {
  constructor(
    @InjectRepository(IncidenteBus)
    private readonly incidenteBusRepository: Repository<IncidenteBus>,
    @InjectRepository(Foto)
    private readonly fotoRepository: Repository<Foto>,
  ) {}

  async create(createDto: CreateIncidenteBusDto): Promise<IncidenteBus> {
    const { incidenteId, busId, fotoUrls = [], notas } = createDto;

    if (fotoUrls.length > 5) {
      throw new BadRequestException('Máximo 5 fotos permitidas por incidente');
    }

    const ib: IncidenteBus = this.incidenteBusRepository.create({
      notas,
      bus: { id: busId } as Bus,
      incidente: { id: incidenteId } as Incidente,
    } as any) as IncidenteBus;

    const savedIb = await this.incidenteBusRepository.save(ib as IncidenteBus);

    if (fotoUrls.length > 0) {
      const fotos = fotoUrls.map((url) =>
        this.fotoRepository.create({
          url,
          incidenteBus: { id: savedIb.id } as any,
        }),
      );
      await this.fotoRepository.save(fotos);
    }

    return this.findOne(savedIb.id!);
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
    if (!ib) {
      throw new NotFoundException(`IncidenteBus with ID ${id} not found`);
    }
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

  async countPhotosByIncidentBus(incidenteBusId: number): Promise<number> {
    return this.fotoRepository.count({
      where: { incidenteBus: { id: incidenteBusId } },
    });
  }

  async validatePhotoLimit(
    incidenteBusId: number,
    newPhotosCount: number,
  ): Promise<boolean> {
    const currentCount = await this.countPhotosByIncidentBus(incidenteBusId);
    if (currentCount + newPhotosCount > 5) {
      throw new BadRequestException(
        `No se pueden agregar ${newPhotosCount} fotos. Máximo permitido: ${5 - currentCount}`,
      );
    }
    return true;
  }
}
