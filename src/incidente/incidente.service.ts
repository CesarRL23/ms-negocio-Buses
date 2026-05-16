import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incidente } from './entities/incidente.entity';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { CreateIncidenteReportDto } from './dto/create-incidente-report.dto';
import { Shift } from '../shift/entities/shift.entity';

@Injectable()
export class IncidenteService {
  constructor(
    @InjectRepository(Incidente)
    private readonly incidenteRepository: Repository<Incidente>,
  ) {}

  async findAll(): Promise<Incidente[]> {
    return this.incidenteRepository.find({
      relations: ['incidenteBuses', 'shift'],
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Incidente> {
    const incidente = await this.incidenteRepository.findOne({
      where: { id },
      relations: ['incidenteBuses', 'shift'],
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

  async reportQuickIncident(
    reportDto: CreateIncidenteReportDto,
    shift: Shift,
    gpsData?: { latitud: number; longitud: number },
  ): Promise<Incidente> {
    const incidente = this.incidenteRepository.create({
      timestamp: new Date(),
      tipo: reportDto.tipo,
      gravedad: reportDto.gravedad,
      descripcion: reportDto.descripcion,
      tipo_otro: reportDto.tipo === 'otro' ? reportDto.tipo_otro : null,
      latitud: gpsData?.latitud,
      longitud: gpsData?.longitud,
      shift,
    } as any) as Incidente;
    return await this.incidenteRepository.save(incidente as Incidente);
  }

  async findIncidentsForShift(shiftId: number): Promise<Incidente[]> {
    return this.incidenteRepository.find({
      where: { shift: { id: shiftId } },
      relations: ['incidenteBuses', 'incidenteBuses.fotos', 'shift'],
      order: { timestamp: 'DESC' },
    });
  }

  async findIncidentsByDriver(
    driverId: number,
    limit: number = 10,
  ): Promise<Incidente[]> {
    return this.incidenteRepository
      .createQueryBuilder('incidente')
      .innerJoinAndSelect('incidente.shift', 'shift')
      .where('shift.driver_id = :driverId', { driverId })
      .leftJoinAndSelect('incidente.incidenteBuses', 'incidenteBuses')
      .leftJoinAndSelect('incidenteBuses.fotos', 'fotos')
      .orderBy('incidente.timestamp', 'DESC')
      .limit(limit)
      .getMany();
  }
}
