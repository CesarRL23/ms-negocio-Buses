import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import { Citizen } from '../citizen/entities/citizen.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,

    @InjectRepository(Citizen)
    private readonly citizenRepository: Repository<Citizen>,
  ) {}

 
  async createForCitizen(citizenId: number, dto: CreateAddressDto): Promise<Address> {

    const citizen = await this.citizenRepository.findOne({
      where: { id: citizenId },
      relations: ['address'],
    });

    if (!citizen) {
      throw new NotFoundException('Citizen no existe');
    }

    if (citizen.address) {
      throw new BadRequestException('El ciudadano ya tiene dirección');
    }

    citizen.address = this.addressRepository.create(dto);

    await this.citizenRepository.save(citizen);

    return citizen.address;
  }

 
  async findByCitizen(citizenId: number): Promise<Address> {

    const citizen = await this.citizenRepository.findOne({
      where: { id: citizenId },
      relations: ['address'],
    });

    if (!citizen) {
      throw new NotFoundException('Citizen no existe');
    }

    if (!citizen.address) {
      throw new NotFoundException('No tiene dirección');
    }

    return citizen.address;
  }

  
  async update(citizenId: number, dto: Partial<CreateAddressDto>): Promise<Address> {

    const citizen = await this.citizenRepository.findOne({
      where: { id: citizenId },
      relations: ['address'],
    });

    if (!citizen || !citizen.address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    Object.assign(citizen.address, dto);

    await this.citizenRepository.save(citizen);

    return citizen.address;
  }

  async remove(citizenId: number): Promise<void> {

    const citizen = await this.citizenRepository.findOne({
      where: { id: citizenId },
      relations: ['address'],
    });

    if (!citizen || !citizen.address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    citizen.address = undefined;

    await this.citizenRepository.save(citizen);
  }
}