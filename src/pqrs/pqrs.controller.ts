import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { PqrsService } from './pqrs.service';
import { CreatePqrsDto } from './dto/create-pqrs.dto';
import { UpdatePqrsDto } from './dto/update-pqrs.dto';

@Controller('pqrs')
export class PqrsController {
  constructor(private readonly service: PqrsService) {}

  @Post()
  create(@Body() dto: CreatePqrsDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('radicado/:radicado')
  findByRadicado(@Param('radicado') radicado: string) {
    return this.service.findByRadicado(radicado);
  }

  @Get('user/:citizenUserId')
  findByUser(@Param('citizenUserId') citizenUserId: string) {
    return this.service.findByUser(citizenUserId);
  }

  @Get('overdue')
  findOverdue() {
    return this.service.findOverdue();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePqrsDto) {
    return this.service.updateStatus(+id, dto);
  }
}
