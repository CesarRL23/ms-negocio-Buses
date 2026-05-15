import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async create(createDriverDto: CreateDriverDto) {
    const driver = this.driverRepository.create({
      person: { id: (createDriverDto as any).personId }
    });
    return await this.driverRepository.save(driver);
  }

  async findAll() {
    return await this.driverRepository.find({
      relations: ['person']
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} driver`;
  }

  update(id: number, updateDriverDto: UpdateDriverDto) {
    return `This action updates a #${id} driver`;
  }

  remove(id: number) {
    return `This action removes a #${id} driver`;
  }
}
