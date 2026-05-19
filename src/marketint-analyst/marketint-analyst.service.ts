import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketingAnalyst } from './entities/marketint-analyst.entity';
import { Company } from '../company/entities/company.entity';
import { Person } from '../person/entities/person.entity';
import { CreateMarketintAnalystDto } from './dto/create-marketint-analyst.dto';
import { UpdateMarketintAnalystDto } from './dto/update-marketint-analyst.dto';

@Injectable()
export class MarketintAnalystService {
  constructor(
    @InjectRepository(MarketingAnalyst)
    private readonly marketingAnalystRepository: Repository<MarketingAnalyst>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async create(
    createMarketintAnalystDto: CreateMarketintAnalystDto,
  ): Promise<MarketingAnalyst> {
    const { companyId, personId } = createMarketintAnalystDto;

    const person = await this.personRepository.findOne({
      where: { id: personId },
    });
    if (!person) {
      throw new NotFoundException(`Person with ID ${personId} not found`);
    }

    let company: any = null;
    if (companyId) {
      company = await this.companyRepository.findOne({
        where: { id: companyId },
      });
      if (!company) {
        throw new NotFoundException(`Company with ID ${companyId} not found`);
      }
    }

    const existingByPerson = await this.marketingAnalystRepository.findOne({
      where: { person: { id: personId } },
    });
    if (existingByPerson) {
      throw new BadRequestException(
        'This person already has a marketing analyst relationship',
      );
    }

    const marketingAnalyst = this.marketingAnalystRepository.create();
    marketingAnalyst.person = person;
    if (company) {
      marketingAnalyst.company = company;
    }

    return this.marketingAnalystRepository.save(marketingAnalyst);
  }

  async findAll(): Promise<MarketingAnalyst[]> {
    return await this.marketingAnalystRepository.find({
      relations: ['company', 'person'],
    });
  }

  async findOne(id: number): Promise<MarketingAnalyst> {
    const marketingAnalyst = await this.marketingAnalystRepository.findOne({
      where: { id },
      relations: ['company', 'person'],
    });

    if (!marketingAnalyst) {
      throw new NotFoundException(`MarketingAnalyst with ID ${id} not found`);
    }

    return marketingAnalyst;
  }

  async findByPersonId(personId: number): Promise<MarketingAnalyst> {
    const marketingAnalyst = await this.marketingAnalystRepository.findOne({
      where: { person: { id: personId } },
      relations: ['company', 'person'],
    });

    if (!marketingAnalyst) {
      throw new NotFoundException(
        `MarketingAnalyst for person with ID ${personId} not found`,
      );
    }

    return marketingAnalyst;
  }

  async update(
    id: number,
    updateMarketintAnalystDto: UpdateMarketintAnalystDto,
  ): Promise<MarketingAnalyst> {
    const marketingAnalyst = await this.findOne(id);

    if (updateMarketintAnalystDto.companyId) {
      const company = await this.companyRepository.findOne({
        where: { id: updateMarketintAnalystDto.companyId },
      });
      if (!company) {
        throw new NotFoundException(
          `Company with ID ${updateMarketintAnalystDto.companyId} not found`,
        );
      }
      marketingAnalyst.company = company;
    }

    if (updateMarketintAnalystDto.personId) {
      const person = await this.personRepository.findOne({
        where: { id: updateMarketintAnalystDto.personId },
      });
      if (!person) {
        throw new NotFoundException(
          `Person with ID ${updateMarketintAnalystDto.personId} not found`,
        );
      }

      const existingByPerson = await this.marketingAnalystRepository.findOne({
        where: { person: { id: updateMarketintAnalystDto.personId } },
      });
      if (existingByPerson && existingByPerson.id !== id) {
        throw new BadRequestException(
          'This person already has a marketing analyst relationship',
        );
      }

      marketingAnalyst.person = person;
    }

    return await this.marketingAnalystRepository.save(marketingAnalyst);
  }

  async remove(id: number): Promise<void> {
    const marketingAnalyst = await this.findOne(id);
    await this.marketingAnalystRepository.remove(marketingAnalyst);
  }
}
