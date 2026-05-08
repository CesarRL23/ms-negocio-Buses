import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PersonGroupService } from './person-group.service';
import { CreatePersonGroupDto } from './dto/create-person-group.dto';
import { UpdatePersonGroupDto } from './dto/update-person-group.dto';

@Controller('person-group')
export class PersonGroupController {
  constructor(private readonly personGroupService: PersonGroupService) {}

  @Post()
  create(@Body() createPersonGroupDto: CreatePersonGroupDto) {
    return this.personGroupService.create(createPersonGroupDto);
  }

  @Get()
  findAll() {
    return this.personGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personGroupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonGroupDto: UpdatePersonGroupDto) {
    return this.personGroupService.update(+id, updatePersonGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personGroupService.remove(+id);
  }
}
