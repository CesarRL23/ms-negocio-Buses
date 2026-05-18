import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incidente, IncidenteEstado } from './entities/incidente.entity';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { CreateIncidenteReportDto } from './dto/create-incidente-report.dto';
import { AddComentarioDto } from './dto/add-comentario.dto';
import { Shift } from '../shift/entities/shift.entity';

export interface IncidenteComentario {
  autor: string;
  texto: string;
  timestamp: string;
}

export interface BusIncidentesStats {
  total: number;
  porTipo: Record<string, number>;
  porEstado: Record<string, number>;
  tasaResolucion: number; // percentage 0-100
}

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
      relations: ['incidenteBuses', 'incidenteBuses.fotos', 'shift', 'shift.driver', 'shift.driver.person'],
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
      estado: IncidenteEstado.PENDIENTE,
      comentarios: null,
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

  /**
   * HU-ENTR-2-008: Fetch all incidents for a specific bus with optional filters
   * and compute statistics.
   */
  async findIncidentsByBus(
    busId: number,
    tipo?: string,
    estado?: string,
  ): Promise<{ incidentes: Incidente[]; estadisticas: BusIncidentesStats }> {
    const qb = this.incidenteRepository
      .createQueryBuilder('incidente')
      .innerJoin('incidente.incidenteBuses', 'ib')
      .innerJoin('ib.bus', 'bus', 'bus.id = :busId', { busId })
      .leftJoinAndSelect('incidente.incidenteBuses', 'ib2')
      .leftJoinAndSelect('ib2.fotos', 'fotos')
      .leftJoinAndSelect('incidente.shift', 'shift')
      .leftJoinAndSelect('shift.driver', 'driver')
      .leftJoinAndSelect('driver.person', 'person')
      .orderBy('incidente.timestamp', 'DESC');

    // Collect ALL incidents first for statistics (before filtering)
    const allIncidentes = await qb.getMany();

    // Now apply filters for the result list
    const filteredQb = this.incidenteRepository
      .createQueryBuilder('incidente')
      .innerJoin('incidente.incidenteBuses', 'ib')
      .innerJoin('ib.bus', 'bus', 'bus.id = :busId', { busId })
      .leftJoinAndSelect('incidente.incidenteBuses', 'ib2')
      .leftJoinAndSelect('ib2.fotos', 'fotos')
      .leftJoinAndSelect('incidente.shift', 'shift')
      .leftJoinAndSelect('shift.driver', 'driver')
      .leftJoinAndSelect('driver.person', 'person')
      .orderBy('incidente.timestamp', 'DESC');

    if (tipo) {
      filteredQb.andWhere('incidente.tipo = :tipo', { tipo });
    }
    if (estado) {
      filteredQb.andWhere('incidente.estado = :estado', { estado });
    }

    const incidentes = await filteredQb.getMany();

    // Build statistics from ALL incidents (not filtered)
    const total = allIncidentes.length;

    const porTipo: Record<string, number> = {};
    const porEstado: Record<string, number> = {};
    let resueltos = 0;

    for (const inc of allIncidentes) {
      const t = inc.tipo || 'desconocido';
      const e = inc.estado || IncidenteEstado.PENDIENTE;
      porTipo[t] = (porTipo[t] || 0) + 1;
      porEstado[e] = (porEstado[e] || 0) + 1;
      if (e === IncidenteEstado.RESUELTO) resueltos++;
    }

    const tasaResolucion = total > 0 ? Math.round((resueltos / total) * 100) : 0;

    return {
      incidentes,
      estadisticas: { total, porTipo, porEstado, tasaResolucion },
    };
  }

  /**
   * HU-ENTR-2-008: Change the status of an incident.
   */
  async changeEstado(id: number, nuevoEstado: string): Promise<Incidente> {
    const validEstados = Object.values(IncidenteEstado) as string[];
    if (!validEstados.includes(nuevoEstado)) {
      throw new Error(`Estado inválido: ${nuevoEstado}`);
    }
    await this.incidenteRepository.update(id, { estado: nuevoEstado } as any);
    return this.findOne(id);
  }

  /**
   * HU-ENTR-2-008: Add a follow-up comment to an incident.
   */
  async addComentario(
    id: number,
    dto: AddComentarioDto,
  ): Promise<Incidente> {
    const incidente = await this.findOne(id);
    const comentarios: IncidenteComentario[] = incidente.comentarios
      ? JSON.parse(incidente.comentarios)
      : [];

    comentarios.push({
      autor: dto.autor,
      texto: dto.texto,
      timestamp: new Date().toISOString(),
    });

    await this.incidenteRepository.update(id, {
      comentarios: JSON.stringify(comentarios),
    } as any);

    return this.findOne(id);
  }

  /**
   * HU-ENTR-2-016: Get time evolution of incidents by type over the last year
   */
  async getIncidentTrends(companyId?: number): Promise<any[]> {
    // 1. Calculate the start date (12 months ago from today)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // 2. Fetch all incidents from startDate to now
    const qb = this.incidenteRepository
      .createQueryBuilder('incidente')
      .leftJoinAndSelect('incidente.shift', 'shift')
      .leftJoinAndSelect('shift.bus', 'bus')
      .leftJoinAndSelect('incidente.incidenteBuses', 'ib')
      .leftJoinAndSelect('ib.bus', 'bus2')
      .where('incidente.timestamp >= :startDate', { startDate })
      .orderBy('incidente.timestamp', 'ASC');

    if (companyId) {
      qb.andWhere(
        '(bus.company_id = :companyId OR bus2.company_id = :companyId)',
        { companyId },
      );
    }

    const incidents = await qb.getMany();

    // 3. Generate list of the last 12 months
    const trendData: Record<string, any> = {};
    const monthsArray: string[] = [];
    const dateCursor = new Date(startDate);
    const now = new Date();

    while (dateCursor <= now) {
      const year = dateCursor.getFullYear();
      const month = String(dateCursor.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`; // "YYYY-MM"
      trendData[key] = {
        mes: key,
        mecanico: 0,
        accidente: 0,
        retraso: 0,
        pasajeros: 0,
        otro: 0,
      };
      monthsArray.push(key);
      // Advance by 1 month
      dateCursor.setMonth(dateCursor.getMonth() + 1);
    }

    // 4. Populate counts
    for (const inc of incidents) {
      if (!inc.timestamp) continue;
      const t = new Date(inc.timestamp);
      const year = t.getFullYear();
      const month = String(t.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      if (trendData[key]) {
        const tipo = (inc.tipo || 'otro').toLowerCase();
        if (tipo === 'mecanico' || tipo === 'médico' || tipo === 'mecanicos') {
          trendData[key].mecanico++;
        } else if (tipo === 'accidente' || tipo === 'accidentes') {
          trendData[key].accidente++;
        } else if (tipo === 'retraso' || tipo === 'retrasos') {
          trendData[key].retraso++;
        } else if (tipo === 'pasajeros' || tipo === 'pasajero') {
          trendData[key].pasajeros++;
        } else {
          trendData[key].otro++;
        }
      }
    }

    // Convert to sorted array
    return monthsArray.map(key => trendData[key]);
  }
}
