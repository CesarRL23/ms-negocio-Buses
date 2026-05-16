import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { IncidenteService } from './incidente.service';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { CreateIncidenteReportDto } from './dto/create-incidente-report.dto';
import { SecurityGuard } from '../guards/security.guard';
import { ShiftService } from '../shift/shift.service';
import { IncidenteBusService } from '../incidente_bus/incidente_bus.service';

@Controller('incidente')
@UseGuards(SecurityGuard)
export class IncidenteController {
  constructor(
    private readonly incidenteService: IncidenteService,
    private readonly shiftService: ShiftService,
    private readonly incidenteBusService: IncidenteBusService,
  ) {}

  @Post()
  async create(
    @Body() reportDto: CreateIncidenteReportDto,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
  ) {
    try {
      if (!reportDto.shiftId) {
        throw new BadRequestException('Turno no especificado o no activo');
      }

      const shift = await this.shiftService.findOne(reportDto.shiftId);
      const gpsData =
        latitude && longitude
          ? {
              latitud: parseFloat(latitude),
              longitud: parseFloat(longitude),
            }
          : undefined;

      const incidente = await this.incidenteService.reportQuickIncident(
        reportDto,
        shift,
        gpsData,
      );

      if (incidente.id && shift.bus) {
        await this.incidenteBusService.create({
          incidenteId: incidente.id,
          busId: shift.bus.id!,
          fotoUrls: reportDto.fotoUrls,
        });
      }

      return incidente;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error al registrar incidente',
      );
    }
  }

  @Get()
  findAll() {
    return this.incidenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidenteService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIncidenteDto: UpdateIncidenteDto,
  ) {
    return this.incidenteService.update(+id, updateIncidenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidenteService.remove(+id);
  }

  @Get('shift/:shiftId')
  async getIncidentsForShift(@Param('shiftId') shiftId: string) {
    return this.incidenteService.findIncidentsForShift(+shiftId);
  }

  @Get('driver/:driverId/history')
  async getDriverIncidentHistory(
    @Param('driverId') driverId: string,
    @Query('limit') limit?: string,
  ) {
    return this.incidenteService.findIncidentsByDriver(
      +driverId,
      limit ? +limit : 10,
    );
  }
}
