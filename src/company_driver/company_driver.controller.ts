import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompanyDriverService } from './company_driver.service';
import { CreateCompanyDriverDto } from './dto/create-company_driver.dto';
import { UpdateCompanyDriverDto } from './dto/update-company_driver.dto';

@Controller('company-driver')
export class CompanyDriverController {
  constructor(private readonly companyDriverService: CompanyDriverService) {}

  @Post()
  create(@Body() createCompanyDriverDto: CreateCompanyDriverDto) {
    return this.companyDriverService.create(createCompanyDriverDto);
  }

  @Get()
  findAll() {
    return this.companyDriverService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyDriverService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDriverDto: UpdateCompanyDriverDto) {
    return this.companyDriverService.update(+id, updateCompanyDriverDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyDriverService.remove(+id);
  }
}
