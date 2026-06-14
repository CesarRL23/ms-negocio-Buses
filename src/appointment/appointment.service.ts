import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { Appointment, AppointmentStatus, AttentionType } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GoogleCalendarService } from './google-calendar.service';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
    private readonly googleCalendar: GoogleCalendarService,
    private readonly config: ConfigService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  //  DISPONIBILIDAD
  // ─────────────────────────────────────────────────────────────────

  async getAvailability() {
    // 1. Obtener slots desde n8n (FreeBusy de Google Calendar)
    const { slots, grouped } = await this.googleCalendar.getAvailableSlots();

    // 2. Obtener citas confirmadas en nuestra BD para excluirlas también
    const confirmed = await this.repo.find({
      where: { estado: AppointmentStatus.CONFIRMED },
      select: ['fecha', 'hora'],
    });

    // Construir set de claves "YYYY-MM-DD|HH:MM" para búsqueda O(1)
    // MySQL puede devolver fecha como Date y hora como "09:00:00" — normalizamos ambos
    const bookedKeys = new Set(
      confirmed.map((a) => {
        const fecha = String(a.fecha).slice(0, 10);
        const hora = String(a.hora).slice(0, 5);
        return `${fecha}|${hora}`;
      }),
    );

    // 3. Filtrar slots ya reservados en BD
    const filteredSlots = slots.filter(
      (s: any) => !bookedKeys.has(`${s.date}|${s.time}`),
    );

    const filteredGrouped: Record<string, any[]> = {};
    for (const s of filteredSlots) {
      if (!filteredGrouped[s.date]) filteredGrouped[s.date] = [];
      filteredGrouped[s.date].push({
        time: s.time,
        dateTimeStart: s.dateTimeStart,
        dateTimeEnd: s.dateTimeEnd,
      });
    }

    return { slots: filteredSlots, grouped: filteredGrouped };
  }

  // ─────────────────────────────────────────────────────────────────
  //  MARCAR CITAS PASADAS COMO COMPLETADAS
  // ─────────────────────────────────────────────────────────────────

  private async markPastAppointmentsAsCompleted() {
    const now = new Date();
    // Fecha y hora actuales en Colombia (UTC-5)
    const padZ = (n: number) => String(n).padStart(2, '0');
    const todayCol = `${now.getUTCFullYear()}-${padZ(now.getUTCMonth() + 1)}-${padZ(now.getUTCDate())}`;
    const hourCol = now.getUTCHours() - 5; // ajuste UTC-5

    const confirmed = await this.repo.find({
      where: { estado: AppointmentStatus.CONFIRMED },
    });

    for (const appt of confirmed) {
      const apptDateTime = new Date(`${appt.fecha}T${appt.hora}:00-05:00`);
      // Si la cita ya terminó (pasaron 30 min desde su inicio)
      if (now.getTime() > apptDateTime.getTime() + 30 * 60_000) {
        appt.estado = AppointmentStatus.COMPLETED;
        await this.repo.save(appt);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  CREAR CITA
  // ─────────────────────────────────────────────────────────────────

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const asesorEmail =
      (this.config.get<string>('ADVISOR_EMAILS') || '').split(',')[0].trim();

    if (!asesorEmail) {
      throw new BadRequestException('No hay asesores disponibles configurados');
    }

    // Construir DateTimes en UTC (Colombia = UTC-5)
    const dateTimeStart = new Date(`${dto.fecha}T${dto.hora}:00-05:00`);
    const dateTimeEnd = new Date(dateTimeStart.getTime() + 30 * 60_000);

    // Verificar que el slot sigue disponible (doble check)
    const existing = await this.repo.findOne({
      where: {
        asesorEmail,
        fecha: dto.fecha,
        hora: dto.hora,
        estado: AppointmentStatus.CONFIRMED,
      },
    });
    if (existing) {
      throw new BadRequestException('Este horario ya fue reservado. Por favor elige otro.');
    }

    const tipoConsultaLabel: Record<string, string> = {
      PROBLEMA_TARJETA: 'Problema con tarjeta',
      RECLAMO: 'Reclamo',
      REEMBOLSO: 'Reembolso',
      OTRO: 'Otro',
    };

    // Crear evento en Google Calendar
    let eventId: string | undefined;
    let meetLink: string | null = null;

    try {
      const result = await this.googleCalendar.createEvent({
        summary: `Cita ${dto.tipoAtencion === AttentionType.VIRTUAL ? 'Virtual' : 'Presencial'} — ${tipoConsultaLabel[dto.tipoConsulta] ?? dto.tipoConsulta}`,
        description: `Cliente: ${dto.citizenName} (${dto.citizenEmail})\nConsulta: ${tipoConsultaLabel[dto.tipoConsulta] ?? dto.tipoConsulta}\nMotivo: ${dto.motivo}`,
        dateTimeStart: dateTimeStart.toISOString(),
        dateTimeEnd: dateTimeEnd.toISOString(),
        attendeeEmail: dto.citizenEmail,
        asesorEmail,
        tipoAtencion: dto.tipoAtencion,
        citizenName: dto.citizenName,
        citizenEmail: dto.citizenEmail,
        tipoConsulta: dto.tipoConsulta,
        motivo: dto.motivo,
        location:
          dto.tipoAtencion === AttentionType.PRESENCIAL
            ? this.config.get<string>('OFFICE_ADDRESS') || 'Calle 65 # 26-10'
            : undefined,
      });
      eventId = result.eventId;
      meetLink = result.meetLink;
    } catch (err: any) {
      this.logger.error('Error n8n Google Calendar: ' + err.message);
      this.logger.warn('La cita se guardará en BD sin evento de calendario.');
    }

    // Guardar en base de datos
    const appointment = this.repo.create({
      ...(dto.citizenId ? { citizen: { id: dto.citizenId } as any } : {}),
      citizenUserId: dto.citizenUserId,
      citizenEmail: dto.citizenEmail,
      citizenName: dto.citizenName,
      fecha: dto.fecha,
      hora: dto.hora,
      tipoAtencion: dto.tipoAtencion,
      tipoConsulta: dto.tipoConsulta,
      motivo: dto.motivo,
      estado: AppointmentStatus.CONFIRMED,
      googleEventId: eventId,
      meetLink: meetLink ?? undefined,
      asesorEmail,
    });

    const saved = await this.repo.save(appointment) as Appointment;

    // Enviar correo de confirmación vía ms-notificaciones
    await this.sendConfirmationEmail(saved);

    return saved;
  }

  // ─────────────────────────────────────────────────────────────────
  //  CANCELAR CITA
  // ─────────────────────────────────────────────────────────────────

  async cancel(id: number): Promise<Appointment> {
    const appointment = await this.repo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException(`Cita #${id} no encontrada`);

    if (appointment.estado === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('La cita ya está cancelada');
    }

    // Cancelar en Google Calendar
    if (appointment.googleEventId) {
      try {
        await this.googleCalendar.cancelEvent(
          appointment.asesorEmail,
          appointment.googleEventId,
        );
      } catch (err: any) {
        this.logger.error('Error cancelando evento en Calendar: ' + err.message);
      }
    }

    appointment.estado = AppointmentStatus.CANCELLED;
    const updated = await this.repo.save(appointment) as Appointment;

    // Enviar correo de cancelación
    await this.sendCancellationEmail(updated);

    return updated;
  }

  // ─────────────────────────────────────────────────────────────────
  //  LISTAR (para el ciudadano o admin)
  // ─────────────────────────────────────────────────────────────────

  async findByUser(citizenUserId: string): Promise<Appointment[]> {
    await this.markPastAppointmentsAsCompleted();
    return this.repo.find({
      where: { citizenUserId },
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async findAll(): Promise<Appointment[]> {
    await this.markPastAppointmentsAsCompleted();
    return this.repo.find({ order: { fecha: 'DESC', hora: 'DESC' } });
  }

  // ─────────────────────────────────────────────────────────────────
  //  NOTIFICACIONES
  // ─────────────────────────────────────────────────────────────────

  private async sendConfirmationEmail(appt: Appointment) {
    const msNotif = this.config.get<string>('MS_NOTIFICATIONS');
    if (!msNotif) return;

    const officeAddress =
      this.config.get<string>('OFFICE_ADDRESS') || 'Calle 65 # 26-10';

    const ubicacion =
      appt.tipoAtencion === AttentionType.VIRTUAL
        ? `Videollamada: ${appt.meetLink || 'El enlace estará disponible próximamente'}`
        : `Presencial: ${officeAddress}`;

    const cancelUrl = `${this.config.get<string>('APP_URL') || 'http://localhost:5173'}/cancelar-cita/${appt.id}`;

    const tipoConsultaLabel: Record<string, string> = {
      PROBLEMA_TARJETA: 'Problema con tarjeta',
      RECLAMO: 'Reclamo',
      REEMBOLSO: 'Reembolso',
      OTRO: 'Otro',
    };

    try {
      await axios.post(`${msNotif}/notifications/email`, {
        to: appt.citizenEmail,
        subject: `✅ Cita confirmada para el ${appt.fecha} a las ${appt.hora}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);padding:30px;border-radius:12px 12px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:24px">🚌 TransMilenio Buses</h1>
              <p style="color:#bfdbfe;margin:8px 0 0">Confirmación de Cita</p>
            </div>

            <div style="background:#f8fafc;padding:30px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
              <p style="color:#374151;font-size:16px">Hola <strong>${appt.citizenName}</strong>,</p>
              <p style="color:#6b7280">Tu cita ha sido agendada exitosamente. Aquí están los detalles:</p>

              <div style="background:white;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e5e7eb">
                <table style="width:100%;border-collapse:collapse">
                  <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">📅 Fecha</td><td style="padding:8px 0;font-weight:bold;color:#111827">${appt.fecha}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">⏰ Hora</td><td style="padding:8px 0;font-weight:bold;color:#111827">${appt.hora}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">📋 Tipo</td><td style="padding:8px 0;font-weight:bold;color:#111827">${appt.tipoAtencion}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">🔍 Consulta</td><td style="padding:8px 0;font-weight:bold;color:#111827">${tipoConsultaLabel[appt.tipoConsulta] ?? appt.tipoConsulta}</td></tr>
                  <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">📍 Ubicación</td><td style="padding:8px 0;font-weight:bold;color:#111827">${ubicacion}</td></tr>
                </table>
              </div>

              ${
                appt.tipoAtencion === AttentionType.VIRTUAL && appt.meetLink
                  ? `<div style="text-align:center;margin:20px 0">
                       <a href="${appt.meetLink}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
                         📹 Unirse a la videollamada
                       </a>
                     </div>`
                  : ''
              }

              <div style="text-align:center;margin:20px 0;border-top:1px solid #e5e7eb;padding-top:20px">
                <p style="color:#6b7280;font-size:14px;margin-bottom:12px">¿Necesitas cancelar?</p>
                <a href="${cancelUrl}" style="background:#ef4444;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;font-size:14px">
                  ❌ Cancelar Cita
                </a>
              </div>

              <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:20px">
                Si tienes dudas, contáctanos respondiendo este correo.
              </p>
            </div>
          </div>
        `,
      });
    } catch (err: any) {
      this.logger.error('Error enviando correo de confirmación: ' + err.message);
    }
  }

  private async sendCancellationEmail(appt: Appointment) {
    const msNotif = this.config.get<string>('MS_NOTIFICATIONS');
    if (!msNotif) return;

    try {
      await axios.post(`${msNotif}/notifications/email`, {
        to: appt.citizenEmail,
        subject: `❌ Cita cancelada — ${appt.fecha} a las ${appt.hora}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <div style="background:linear-gradient(135deg,#7f1d1d,#ef4444);padding:30px;border-radius:12px 12px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:24px">🚌 TransMilenio Buses</h1>
              <p style="color:#fecaca;margin:8px 0 0">Cita Cancelada</p>
            </div>
            <div style="background:#f8fafc;padding:30px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
              <p style="color:#374151">Hola <strong>${appt.citizenName}</strong>,</p>
              <p style="color:#6b7280">Tu cita del <strong>${appt.fecha} a las ${appt.hora}</strong> ha sido cancelada exitosamente.</p>
              <p style="color:#6b7280">Si deseas reagendar, puedes hacerlo desde la sección <strong>Atención al Cliente</strong> en la app.</p>
            </div>
          </div>
        `,
      });
    } catch (err: any) {
      this.logger.error('Error enviando correo de cancelación: ' + err.message);
    }
  }
}
