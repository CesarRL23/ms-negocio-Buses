import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { IncidenteBusService } from './incidente_bus.service';
import { CreateIncidenteBusDto } from './dto/create-incidente-bus.dto';
import { UpdateIncidenteBusDto } from './dto/update-incidente-bus.dto';
import { SecurityGuard } from '../guards/security.guard';
import { FotoService } from '../foto/foto.service';

@Controller('incidente-bus')
@UseGuards(SecurityGuard)
export class IncidenteBusController {
  constructor(
    private readonly service: IncidenteBusService,
    private readonly fotoService: FotoService,
  ) {}

  @Post()
  create(@Body() dto: CreateIncidenteBusDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIncidenteBusDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Post(':id/upload-fotos')
  async uploadPhotos(
    @Param('id') id: string,
    @Body() body: { fotoUrls: string[] },
  ) {
    const incidenteBusId = +id;

    if (!Array.isArray(body.fotoUrls) || body.fotoUrls.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos una URL de foto');
    }

    if (body.fotoUrls.length > 5) {
      throw new BadRequestException('Máximo 5 fotos permitidas por incidente');
    }

    await this.fotoService.validatePhotoLimitForIncidenteBus(
      incidenteBusId,
      body.fotoUrls.length,
    );

    const fotos = await Promise.all(
      body.fotoUrls.map((url) =>
        this.fotoService.create({
          url,
          incidenteBusId,
        } as any),
      ),
    );

    return {
      message: `${fotos.length} fotos cargadas exitosamente`,
      fotos,
    };
  }
}
