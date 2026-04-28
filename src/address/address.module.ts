import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { Address } from './entities/address.entity';
import { Citizen } from '../citizen/entities/citizen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address, Citizen])],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
