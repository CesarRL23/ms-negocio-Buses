import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Pqrs } from './entities/pqrs.entity';
import { CreatePqrsDto } from './dto/create-pqrs.dto';
import { UpdatePqrsDto } from './dto/update-pqrs.dto';
import axios from 'axios';

const ESTIMATED_DAYS: Record<string, number> = {
  PETICION: 15,
  QUEJA: 10,
  RECLAMO: 7,
  SUGERENCIA: 20,
};

const DEPT_EMAIL: Record<string, string> = {
  CONDUCTOR: 'conductores@transporte.com',
  BUS:       'mantenimiento@transporte.com',
  RUTA:      'operaciones@transporte.com',
  TARJETA:   'soporte@transporte.com',
  OTRO:      'atencion@transporte.com',
};

const STATUS_LABEL: Record<string, string> = {
  EN_REVISION: 'En revisión — un agente ha tomado tu caso',
  EN_PROCESO:  'En proceso — estamos trabajando en resolverlo',
  RESUELTO:    'Resuelto — revisa la respuesta del agente',
};

@Injectable()
export class PqrsService {
  private readonly notifUrl  = process.env.MS_NOTIFICATIONS || 'http://localhost:5000';
  private readonly n8nPqrsWebhook = process.env.N8N_PQRS_WEBHOOK || '';

  constructor(
    @InjectRepository(Pqrs)
    private readonly repo: Repository<Pqrs>,
  ) {}

  async create(dto: CreatePqrsDto): Promise<Pqrs> {
    const estimatedDays = ESTIMATED_DAYS[dto.type] ?? 10;
    const pqrs = this.repo.create({ ...dto, estimatedDays });
    const saved = await this.repo.save(pqrs);

    // Generar radicado después de tener el id
    const year = new Date().getFullYear();
    saved.radicado = `PQRS-${year}-${String(saved.id).padStart(6, '0')}`;
    await this.repo.save(saved);

    // Email de confirmación al ciudadano
    this.sendConfirmationEmail(saved).catch(() => {});

    // Notificación al departamento vía n8n (email + Slack)
    this.notifyDepartmentViaN8n(saved).catch(() => {});

    return saved;
  }

  findAll(): Promise<Pqrs[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findByRadicado(radicado: string): Promise<Pqrs> {
    const pqrs = await this.repo.findOne({ where: { radicado } });
    if (!pqrs) throw new NotFoundException(`PQRS ${radicado} no encontrado`);
    return pqrs;
  }

  async findByUser(citizenUserId: string): Promise<Pqrs[]> {
    return this.repo.find({
      where: { citizenUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, dto: UpdatePqrsDto): Promise<Pqrs> {
    const pqrs = await this.repo.findOne({ where: { id } });
    if (!pqrs) throw new NotFoundException(`PQRS #${id} no encontrado`);

    Object.assign(pqrs, dto);
    if (dto.status === 'RESUELTO') {
      pqrs.resolvedAt = new Date();
    }
    const updated = await this.repo.save(pqrs);

    // Notificar al usuario del cambio de estado
    if (dto.status && STATUS_LABEL[dto.status]) {
      this.sendStatusEmail(updated).catch(() => {});
    }

    return updated;
  }

  // Retorna PQRS no resueltos cuyo plazo ha vencido (para n8n)
  findOverdue(): Promise<Pqrs[]> {
    const now = new Date();
    return this.repo
      .createQueryBuilder('p')
      .where('p.status != :resolved', { resolved: 'RESUELTO' })
      .andWhere(
        `DATE_ADD(p.createdAt, INTERVAL p.estimatedDays DAY) < :now`,
        { now },
      )
      .getMany();
  }

  private async notifyDepartmentViaN8n(pqrs: Pqrs) {
    if (!this.n8nPqrsWebhook) return;
    await axios.post(this.n8nPqrsWebhook, {
      radicado:     pqrs.radicado,
      type:         pqrs.type,
      category:     pqrs.category,
      description:  pqrs.description,
      email:        pqrs.email,
      citizenName:  pqrs.citizenName || pqrs.email,
      estimatedDays: pqrs.estimatedDays,
      createdAt:    pqrs.createdAt,
      deptEmail:    DEPT_EMAIL[pqrs.category] || DEPT_EMAIL['OTRO'],
    });
  }

  private async sendConfirmationEmail(pqrs: Pqrs) {
    await axios.post(`${this.notifUrl}/send-pqrs-confirmation`, {
      to: pqrs.email,
      name: pqrs.citizenName || pqrs.email,
      radicado: pqrs.radicado,
      type: pqrs.type,
      category: pqrs.category,
      description: pqrs.description,
      estimatedDays: pqrs.estimatedDays,
    });
  }

  private async sendStatusEmail(pqrs: Pqrs) {
    await axios.post(`${this.notifUrl}/send-pqrs-status`, {
      to: pqrs.email,
      name: pqrs.citizenName || pqrs.email,
      radicado: pqrs.radicado,
      status: pqrs.status,
      statusLabel: STATUS_LABEL[pqrs.status] || pqrs.status,
      agentResponse: pqrs.agentResponse,
    });
  }
}
