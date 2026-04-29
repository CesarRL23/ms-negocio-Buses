import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Bus } from './entities/bus.entity';
import { BusService } from './bus.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';

@Controller('bus')
export class BusController {
  constructor(private readonly busService: BusService) {}

  @Post()
  create(@Body() createBusDto: CreateBusDto) {
    return this.busService.create(createBusDto);
  }

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.busService.findAll(companyId ? +companyId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.busService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBusDto: UpdateBusDto) {
    return this.busService.update(+id, updateBusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.busService.remove(+id);
  }
}
