import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incidente } from '../incidente/entities/incidente.entity';
import { Company } from '../company/entities/company.entity';
import { IncidentTrendsDto, TrendMonthDto, CompanyOptionDto } from './dto/incident-trends.dto';

const TIPOS = ['mecanico', 'accidente', 'retraso', 'pasajeros', 'otro'] as const;

function classifyTipo(raw: string): string {
  const t = (raw || 'otro').toLowerCase();
  if (t === 'mecanico' || t === 'mecanicos' || t === 'médico') return 'mecanico';
  if (t === 'accidente' || t === 'accidentes') return 'accidente';
  if (t === 'retraso' || t === 'retrasos') return 'retraso';
  if (t === 'pasajeros' || t === 'pasajero') return 'pasajeros';
  return 'otro';
}

@Injectable()
export class OperationsManagerService {
  constructor(
    @InjectRepository(Incidente)
    private readonly incidenteRepository: Repository<Incidente>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async getIncidentTrends(period: number, companyId?: number): Promise<IncidentTrendsDto> {
    const validPeriods = [3, 6, 12];
    const months = validPeriods.includes(period) ? period : 6;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const qb = this.incidenteRepository
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.shift', 'shift')
      .leftJoinAndSelect('shift.bus', 'bus')
      .leftJoinAndSelect('i.incidenteBuses', 'ib')
      .leftJoinAndSelect('ib.bus', 'bus2')
      .where('i.timestamp >= :start', { start: startDate })
      .orderBy('i.timestamp', 'ASC');

    if (companyId) {
      qb.andWhere(
        '(bus.company_id = :cid OR bus2.company_id = :cid)',
        { cid: companyId },
      );
    }

    const incidents = await qb.getMany();

    const allMonths: string[] = [];
    const cursor = new Date(startDate);
    const now = new Date();
    while (
      cursor.getFullYear() < now.getFullYear() ||
      (cursor.getFullYear() === now.getFullYear() && cursor.getMonth() <= now.getMonth())
    ) {
      allMonths.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const trendMap: Record<string, TrendMonthDto> = {};
    for (const m of allMonths) {
      trendMap[m] = { mes: m, mecanico: 0, accidente: 0, retraso: 0, pasajeros: 0, otro: 0 };
    }

    for (const inc of incidents) {
      if (!inc.timestamp) continue;
      const t = new Date(inc.timestamp);
      const key = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`;
      if (trendMap[key]) {
        trendMap[key][classifyTipo(inc.tipo ?? 'otro')]++;
      }
    }

    const trends = allMonths.map((m) => trendMap[m]);
    const totals = TIPOS.reduce(
      (acc, tipo) => {
        acc[tipo] = trends.reduce((s, row) => s + (row[tipo] ?? 0), 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    return { period: months, months: allMonths, trends, totals: totals as any };
  }

  async getCompanies(): Promise<CompanyOptionDto[]> {
    const companies = await this.companyRepository.find({ where: { activo: true } });
    return companies.map((c) => ({ id: c.id!, name: c.name! }));
  }
}
