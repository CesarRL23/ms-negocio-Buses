import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyDriver } from './entities/company_driver.entity';
import { Company } from '../company/entities/company.entity';
import { Driver } from '../driver/entities/driver.entity';
import { CreateCompanyDriverDto } from './dto/create-company_driver.dto';
import { UpdateCompanyDriverDto } from './dto/update-company_driver.dto';

@Injectable()
export class CompanyDriverService {
  constructor(
    @InjectRepository(CompanyDriver)
    private readonly companyDriverRepository: Repository<CompanyDriver>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async create(createCompanyDriverDto: CreateCompanyDriverDto): Promise<CompanyDriver> {
    const { companyId, driverId } = createCompanyDriverDto;

    // Validar que la compañía existe
    const company = await this.companyRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Validar que el conductor existe
    const driver = await this.driverRepository.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException(`Driver with ID ${driverId} not found`);
    }

    // Verificar si la relación ya existe
    const existingRelation = await this.companyDriverRepository.findOne({
      where: { company: { id: companyId }, driver: { id: driverId } },
    });
    if (existingRelation) {
      throw new BadRequestException('This company-driver relationship already exists');
    }

    const companyDriver = this.companyDriverRepository.create({
      company,
      driver,
    });
    return await this.companyDriverRepository.save(companyDriver);
  }

  async findAll(): Promise<CompanyDriver[]> {
    return await this.companyDriverRepository.find({
      relations: ['company', 'driver'],
    });
  }

  async findOne(id: number): Promise<CompanyDriver> {
    const companyDriver = await this.companyDriverRepository.findOne({
      where: { id },
      relations: ['company', 'driver'],
    });
    if (!companyDriver) {
      throw new NotFoundException(`CompanyDriver with ID ${id} not found`);
    }
    return companyDriver;
  }

  async update(
    id: number,
    updateCompanyDriverDto: UpdateCompanyDriverDto,
  ): Promise<CompanyDriver> {
    const companyDriver = await this.findOne(id);

    if (updateCompanyDriverDto.companyId) {
      const company = await this.companyRepository.findOne({
        where: { id: updateCompanyDriverDto.companyId },
      });
      if (!company) {
        throw new NotFoundException(`Company with ID ${updateCompanyDriverDto.companyId} not found`);
      }
      companyDriver.company = company;
    }

    if (updateCompanyDriverDto.driverId) {
      const driver = await this.driverRepository.findOne({
        where: { id: updateCompanyDriverDto.driverId },
      });
      if (!driver) {
        throw new NotFoundException(`Driver with ID ${updateCompanyDriverDto.driverId} not found`);
      }
      companyDriver.driver = driver;
    }

    return await this.companyDriverRepository.save(companyDriver);
  }

  async remove(id: number): Promise<void> {
    const companyDriver = await this.findOne(id);
    await this.companyDriverRepository.remove(companyDriver);
  }
}
