import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompanyAdminService } from './company_admin.service';
import { CreateCompanyAdminDto } from './dto/create-company_admin.dto';
import { UpdateCompanyAdminDto } from './dto/update-company_admin.dto';

@Controller('company-admin')
export class CompanyAdminController {
  constructor(private readonly companyAdminService: CompanyAdminService) {}

  @Post()
  create(@Body() createCompanyAdminDto: CreateCompanyAdminDto) {
    return this.companyAdminService.create(createCompanyAdminDto);
  }

  @Get()
  findAll() {
    return this.companyAdminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyAdminService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyAdminDto: UpdateCompanyAdminDto,
  ) {
    return this.companyAdminService.update(+id, updateCompanyAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyAdminService.remove(+id);
  }
}
