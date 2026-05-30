import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.create(createPersonDto);
  }

  @Post('sync')
  sync(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.sync(createPersonDto);
  }

  @Get('search')
  search(@Query('q') q: string, @Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
    return this.personService.searchByNombre(q || '', token);
  }

  @Get('by-user-id/:userId')
  findByUserId(@Param('userId') userId: string, @Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
    return this.personService.findByUserId(userId, token);
  }

  @Get()
  findAll() {
    return this.personService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.personService.update(+id, updatePersonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personService.remove(+id);
  }
}
