import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  
  @Post(':citizenId')
  create(
    @Param('citizenId') citizenId: string,
    @Body() dto: CreateAddressDto
  ) {
    return this.addressService.createForCitizen(+citizenId, dto);
  }

 
  @Get(':citizenId')
  findOne(@Param('citizenId') citizenId: string) {
    return this.addressService.findByCitizen(+citizenId);
  }

  
  @Patch(':citizenId')
  update(
    @Param('citizenId') citizenId: string,
    @Body() dto: UpdateAddressDto
  ) {
    return this.addressService.update(+citizenId, dto);
  }

  
  @Delete(':citizenId')
  remove(@Param('citizenId') citizenId: string) {
    return this.addressService.remove(+citizenId);
  }
}