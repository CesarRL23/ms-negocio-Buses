import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyAdmin } from './entities/company_admin.entity';
import { Company } from '../company/entities/company.entity';
import { Person } from '../person/entities/person.entity';
import { CreateCompanyAdminDto } from './dto/create-company_admin.dto';
import { UpdateCompanyAdminDto } from './dto/update-company_admin.dto';

@Injectable()
export class CompanyAdminService {
  constructor(
    @InjectRepository(CompanyAdmin)
    private readonly companyAdminRepository: Repository<CompanyAdmin>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async create(
    createCompanyAdminDto: CreateCompanyAdminDto,
  ): Promise<CompanyAdmin> {
    const { companyId, personId } = createCompanyAdminDto;

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const person = await this.personRepository.findOne({
      where: { id: personId },
    });
    if (!person) {
      throw new NotFoundException(`Person with ID ${personId} not found`);
    }

    const existingByPerson = await this.companyAdminRepository.findOne({
      where: { person: { id: personId } },
    });
    if (existingByPerson) {
      throw new BadRequestException('This person already has a company admin relationship');
    }

    const companyAdmin = this.companyAdminRepository.create({
      company,
      person,
    });

    return await this.companyAdminRepository.save(companyAdmin);
  }

  async findAll(): Promise<CompanyAdmin[]> {
    return await this.companyAdminRepository.find({
      relations: ['company', 'person'],
    });
  }

  async findOne(id: number): Promise<CompanyAdmin> {
    const companyAdmin = await this.companyAdminRepository.findOne({
      where: { id },
      relations: ['company', 'person'],
    });

    if (!companyAdmin) {
      throw new NotFoundException(`CompanyAdmin with ID ${id} not found`);
    }

    return companyAdmin;
  }

  async findByPersonId(personId: number): Promise<CompanyAdmin> {
    const companyAdmin = await this.companyAdminRepository.findOne({
      where: { person: { id: personId } },
      relations: ['company', 'person'],
    });

    if (!companyAdmin) {
      throw new NotFoundException(
        `CompanyAdmin for person with ID ${personId} not found`,
      );
    }

    return companyAdmin;
  }

  async update(
    id: number,
    updateCompanyAdminDto: UpdateCompanyAdminDto,
  ): Promise<CompanyAdmin> {
    const companyAdmin = await this.findOne(id);

    if (updateCompanyAdminDto.companyId) {
      const company = await this.companyRepository.findOne({
        where: { id: updateCompanyAdminDto.companyId },
      });
      if (!company) {
        throw new NotFoundException(
          `Company with ID ${updateCompanyAdminDto.companyId} not found`,
        );
      }
      companyAdmin.company = company;
    }

    if (updateCompanyAdminDto.personId) {
      const person = await this.personRepository.findOne({
        where: { id: updateCompanyAdminDto.personId },
      });
      if (!person) {
        throw new NotFoundException(
          `Person with ID ${updateCompanyAdminDto.personId} not found`,
        );
      }

      const existingByPerson = await this.companyAdminRepository.findOne({
        where: { person: { id: updateCompanyAdminDto.personId } },
      });
      if (existingByPerson && existingByPerson.id !== id) {
        throw new BadRequestException(
          'This person already has a company admin relationship',
        );
      }

      companyAdmin.person = person;
    }

    return await this.companyAdminRepository.save(companyAdmin);
  }

  async remove(id: number): Promise<void> {
    const companyAdmin = await this.findOne(id);
    await this.companyAdminRepository.remove(companyAdmin);
  }
}
