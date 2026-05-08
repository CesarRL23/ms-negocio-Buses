import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FotoService } from './foto.service';
import { CreateFotoDto } from './dto/create-foto.dto';
import { UpdateFotoDto } from './dto/update-foto.dto';

@Controller('foto')
export class FotoController {
  constructor(private readonly fotoService: FotoService) {}

  @Post()
  create(@Body() dto: CreateFotoDto) {
    return this.fotoService.create(dto);
  }

  @Get()
  findAll() {
    return this.fotoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fotoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFotoDto) {
    return this.fotoService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fotoService.remove(+id);
  }
}
