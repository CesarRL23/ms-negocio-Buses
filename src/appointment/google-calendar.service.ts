import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AttentionType } from './entities/appointment.entity';

export interface TimeSlot {
  date: string;
  time: string;
  dateTimeStart: string;
  dateTimeEnd: string;
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private readonly config: ConfigService) {}

  async getAvailableSlots(): Promise<{ slots: TimeSlot[]; grouped: Record<string, any[]> }> {
    const url = this.config.get<string>('N8N_WEBHOOK_DISPONIBILIDAD');
    if (!url) throw new InternalServerErrorException('N8N_WEBHOOK_DISPONIBILIDAD no configurado');

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (err: any) {
      this.logger.error('Error llamando n8n disponibilidad: ' + err.message);
      throw new InternalServerErrorException('No se pudo obtener disponibilidad');
    }
  }

  async createEvent(params: {
    summary: string;
    description: string;
    dateTimeStart: string;
    dateTimeEnd: string;
    attendeeEmail: string;
    asesorEmail: string;
    tipoAtencion: AttentionType;
    citizenName: string;
    citizenEmail: string;
    tipoConsulta: string;
    motivo: string;
    location?: string;
  }): Promise<{ eventId: string; meetLink: string | null }> {
    const url = this.config.get<string>('N8N_WEBHOOK_AGENDAR');
    if (!url) throw new InternalServerErrorException('N8N_WEBHOOK_AGENDAR no configurado');

    try {
      const response = await axios.post(url, {
        dateTimeStart: params.dateTimeStart,
        dateTimeEnd: params.dateTimeEnd,
        tipoAtencion: params.tipoAtencion,
        tipoConsulta: params.tipoConsulta,
        citizenName: params.citizenName,
        citizenEmail: params.citizenEmail,
        motivo: params.motivo,
      });

      const data = response.data;
      const meetLink = data?.hangoutLink ?? null;

      return {
        eventId: data.id,
        meetLink,
      };
    } catch (err: any) {
      this.logger.error('Error llamando n8n agendar: ' + err.message);
      throw new InternalServerErrorException('No se pudo crear el evento en Google Calendar');
    }
  }

  async cancelEvent(asesorEmail: string, eventId: string): Promise<void> {
    const url = this.config.get<string>('N8N_WEBHOOK_CANCELAR');
    if (!url) throw new InternalServerErrorException('N8N_WEBHOOK_CANCELAR no configurado');

    try {
      await axios.post(url, { googleEventId: eventId });
    } catch (err: any) {
      this.logger.error('Error llamando n8n cancelar: ' + err.message);
      throw err;
    }
  }
}
