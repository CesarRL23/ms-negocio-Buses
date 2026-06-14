import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { WeatherAlertService } from './weather-alert.service';
import { CreateWeatherAlertDto } from './dto/create-weather-alert.dto';
import { UpdateWeatherAlertDto } from './dto/update-weather-alert.dto';

@Controller('weather-alert')
export class WeatherAlertController {
  constructor(private readonly service: WeatherAlertService) {}

  // Crear o actualizar preferencias de alerta del usuario
  @Post()
  upsert(@Body() dto: CreateWeatherAlertDto) {
    return this.service.upsert(dto);
  }

  // Obtener preferencias del usuario por su userId de ms-security
  @Get('user/:citizenUserId')
  findByUser(@Param('citizenUserId') citizenUserId: string) {
    return this.service.findByUser(citizenUserId);
  }

  // Listar todos los suscriptores activos (usado por n8n a las 6 AM)
  @Get('subscribers')
  getActiveSubscribers() {
    return this.service.getActiveSubscribers();
  }

  // Actualizar (activar/desactivar, cambiar hora de viaje)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWeatherAlertDto) {
    return this.service.update(+id, dto);
  }

  // Eliminar alertas del usuario
  @Delete('user/:citizenUserId')
  remove(@Param('citizenUserId') citizenUserId: string) {
    return this.service.remove(citizenUserId);
  }
}
