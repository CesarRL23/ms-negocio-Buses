import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WhereaboutsService } from './whereabouts.service';
import { CreateWhereaboutDto } from './dto/create-whereabout.dto';
import { UpdateWhereaboutDto } from './dto/update-whereabout.dto';

@Controller('whereabouts')
export class WhereaboutsController {
  constructor(private readonly whereaboutsService: WhereaboutsService) {}

  @Post()
  create(@Body() createWhereaboutDto: CreateWhereaboutDto) {
    return this.whereaboutsService.create(createWhereaboutDto);
  }

  @Get()
  findAll() {
    return this.whereaboutsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.whereaboutsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWhereaboutDto: UpdateWhereaboutDto) {
    return this.whereaboutsService.update(+id, updateWhereaboutDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.whereaboutsService.remove(+id);
  }
}
