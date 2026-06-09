import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly service: AppointmentService) {}

  /**
   * GET /appointment/availability
   * Devuelve los slots disponibles para los próximos 10 días.
   * Ruta pública (sin permiso especial) — se agrega al guard.
   */
  @Get('availability')
  getAvailability() {
    return this.service.getAvailability();
  }

  /**
   * GET /appointment/user/:userId
   * Lista las citas de un ciudadano por su Firebase userId.
   */
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  /**
   * GET /appointment
   * Lista todas las citas (admin).
   */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * POST /appointment
   * Crea una nueva cita, registra en Google Calendar y envía email.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAppointmentDto) {
    return this.service.create(dto);
  }

  /**
   * DELETE /appointment/:id
   * Cancela la cita y elimina el evento de Google Calendar.
   */
  @Delete(':id')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancel(id);
  }
}
