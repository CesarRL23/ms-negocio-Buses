import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import { AttentionType } from './entities/appointment.entity';

export interface TimeSlot {
  date: string;   // 'YYYY-MM-DD'
  time: string;   // 'HH:MM'
  dateTimeStart: string; // ISO
  dateTimeEnd: string;   // ISO
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private calendar: calendar_v3.Calendar;

  constructor(private readonly config: ConfigService) {
    const credentials = {
      type: 'service_account',
      project_id: config.get<string>('GOOGLE_PROJECT_ID'),
      private_key_id: config.get<string>('GOOGLE_PRIVATE_KEY_ID'),
      private_key: (config.get<string>('GOOGLE_PRIVATE_KEY') || '').replace(/\\n/g, '\n'),
      client_email: config.get<string>('GOOGLE_CLIENT_EMAIL'),
      client_id: config.get<string>('GOOGLE_CLIENT_ID'),
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  /**
   * Devuelve los bloques de 30 minutos disponibles para los próximos `days` días
   * en el horario laboral 08:00–17:00 (Colombia, UTC-5).
   */
  async getAvailableSlots(days = 10): Promise<TimeSlot[]> {
    const advisorEmails: string[] = (
      this.config.get<string>('ADVISOR_EMAILS') || ''
    )
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    if (!advisorEmails.length) {
      throw new InternalServerErrorException('No hay asesores configurados (ADVISOR_EMAILS)');
    }

    // Rango de consulta
    const now = new Date();
    const timeMin = new Date(now);
    timeMin.setDate(timeMin.getDate() + 1); // desde mañana
    timeMin.setHours(0, 0, 0, 0);

    const timeMax = new Date(timeMin);
    timeMax.setDate(timeMax.getDate() + days);

    // FreeBusy query
    let busyIntervals: { start: string; end: string }[] = [];
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          timeZone: 'America/Bogota',
          items: advisorEmails.map((email) => ({ id: email })),
        },
      });

      const calendars = response.data.calendars || {};
      for (const email of advisorEmails) {
        const busy = calendars[email]?.busy || [];
        busyIntervals = busyIntervals.concat(
          busy.map((b) => ({ start: b.start!, end: b.end! })),
        );
      }
    } catch (error: any) {
      this.logger.error('Error consultando FreeBusy: ' + error.message);
      // Si el service account no tiene acceso al calendario del asesor,
      // retornamos todos los slots como disponibles (fallback)
      this.logger.warn('Retornando todos los slots como disponibles (fallback)');
    }

    const slots = this.buildSlots(timeMin, timeMax, busyIntervals);
    return slots;
  }

  /**
   * Genera todos los bloques de 30 min de 08:00 a 17:00 (lun-vie),
   * excluyendo los que coinciden con intervalos ocupados.
   */
  private buildSlots(
    from: Date,
    to: Date,
    busy: { start: string; end: string }[],
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const SLOT_MINUTES = 30;
    const WORK_START_H = 8;
    const WORK_END_H = 17; // hasta las 17:00 (última cita 16:30)

    const busyParsed = busy.map((b) => ({
      start: new Date(b.start).getTime(),
      end: new Date(b.end).getTime(),
    }));

    const cursor = new Date(from);
    while (cursor < to) {
      const dow = cursor.getDay(); // 0=dom, 6=sáb
      if (dow !== 0 && dow !== 6) {
        // Día hábil
        for (let h = WORK_START_H; h < WORK_END_H; h++) {
          for (let m = 0; m < 60; m += SLOT_MINUTES) {
            const slotStart = new Date(cursor);
            slotStart.setHours(h, m, 0, 0);
            const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60_000);

            // Omitir slots en el pasado
            if (slotStart <= new Date()) continue;

            // Verificar si está ocupado
            const isBusy = busyParsed.some(
              (b) => slotStart.getTime() < b.end && slotEnd.getTime() > b.start,
            );

            if (!isBusy) {
              const dateStr = slotStart.toISOString().slice(0, 10);
              const pad = (n: number) => String(n).padStart(2, '0');
              const timeStr = `${pad(h)}:${pad(m)}`;
              slots.push({
                date: dateStr,
                time: timeStr,
                dateTimeStart: slotStart.toISOString(),
                dateTimeEnd: slotEnd.toISOString(),
              });
            }
          }
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return slots;
  }

  /**
   * Crea el evento en Google Calendar y devuelve el eventId y meetLink.
   */
  async createEvent(params: {
    summary: string;
    description: string;
    dateTimeStart: string;
    dateTimeEnd: string;
    attendeeEmail: string;
    asesorEmail: string;
    tipoAtencion: AttentionType;
    location?: string;
  }): Promise<{ eventId: string; meetLink: string | null }> {
    const isVirtual = params.tipoAtencion === AttentionType.VIRTUAL;

    // Los Service Accounts NO pueden agregar attendees en cuentas personales Gmail
    // (requiere Domain-Wide Delegation, solo disponible en Google Workspace).
    // Se incluye el email del cliente en la descripción del evento.
    const eventBody: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description + `\n\n👤 Cliente: ${params.attendeeEmail}`,
      start: {
        dateTime: params.dateTimeStart,
        timeZone: 'America/Bogota',
      },
      end: {
        dateTime: params.dateTimeEnd,
        timeZone: 'America/Bogota',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    if (!isVirtual && params.location) {
      eventBody.location = params.location;
    }

    if (isVirtual) {
      eventBody.conferenceData = {
        createRequest: {
          requestId: `cita-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    const response = await this.calendar.events.insert({
      calendarId: params.asesorEmail,
      conferenceDataVersion: isVirtual ? 1 : 0,
      sendUpdates: 'none',
      requestBody: eventBody,
    });

    const event = response.data;
    const meetLink =
      event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')
        ?.uri ?? null;

    return {
      eventId: event.id!,
      meetLink,
    };
  }

  /**
   * Cancela (elimina) un evento del calendario del asesor.
   */
  async cancelEvent(asesorEmail: string, eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: asesorEmail,
        eventId,
        sendUpdates: 'none',
      });
    } catch (error: any) {
      this.logger.error(`Error cancelando evento ${eventId}: ${error.message}`);
      throw error;
    }
  }
}
