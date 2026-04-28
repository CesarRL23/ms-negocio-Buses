import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCitizenPaymentMethodDto } from './dto/create-citizen_payment_method.dto';
import { UpdateCitizenPaymentMethodDto } from './dto/update-citizen_payment_method.dto';
import { CitizenPaymentMethod } from './entities/citizen_payment_method.entity';

@Injectable()
export class CitizenPaymentMethodService {
  constructor(
    @InjectRepository(CitizenPaymentMethod)
    private readonly citizenPaymentMethodRepository: Repository<CitizenPaymentMethod>,
  ) {}

  async create(createCitizenPaymentMethodDto: CreateCitizenPaymentMethodDto) {
    const citizenPaymentMethod = this.citizenPaymentMethodRepository.create(
      createCitizenPaymentMethodDto,
    );
    return await this.citizenPaymentMethodRepository.save(citizenPaymentMethod);
  }

  async findAll() {
    return await this.citizenPaymentMethodRepository.find({
      relations: ['citizen', 'paymentMethod', 'tickets'],
    });
  }

  async findOne(id: number) {
    const citizenPaymentMethod = await this.citizenPaymentMethodRepository.findOne({
      where: { id },
      relations: ['citizen', 'paymentMethod', 'tickets'],
    });
    if (!citizenPaymentMethod) {
      throw new NotFoundException(`CitizenPaymentMethod con id ${id} no encontrado`);
    }
    return citizenPaymentMethod;
  }

  async update(id: number, updateCitizenPaymentMethodDto: UpdateCitizenPaymentMethodDto) {
    await this.findOne(id);
    await this.citizenPaymentMethodRepository.update(id, updateCitizenPaymentMethodDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const citizenPaymentMethod = await this.findOne(id);
    await this.citizenPaymentMethodRepository.delete(id);
    return citizenPaymentMethod;
  }
}
