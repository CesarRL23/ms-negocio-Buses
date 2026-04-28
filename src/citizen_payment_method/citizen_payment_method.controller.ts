import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CitizenPaymentMethodService } from './citizen_payment_method.service';
import { CreateCitizenPaymentMethodDto } from './dto/create-citizen_payment_method.dto';
import { UpdateCitizenPaymentMethodDto } from './dto/update-citizen_payment_method.dto';

@Controller('citizen-payment-method')
export class CitizenPaymentMethodController {
  constructor(private readonly citizenPaymentMethodService: CitizenPaymentMethodService) {}

  @Post()
  create(@Body() createCitizenPaymentMethodDto: CreateCitizenPaymentMethodDto) {
    return this.citizenPaymentMethodService.create(createCitizenPaymentMethodDto);
  }

  @Get()
  findAll() {
    return this.citizenPaymentMethodService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citizenPaymentMethodService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCitizenPaymentMethodDto: UpdateCitizenPaymentMethodDto) {
    return this.citizenPaymentMethodService.update(+id, updateCitizenPaymentMethodDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citizenPaymentMethodService.remove(+id);
  }
}
