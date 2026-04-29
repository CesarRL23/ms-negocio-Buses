import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bus } from './entities/bus.entity';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';

@Injectable()
export class BusService {
  constructor(
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
  ) {}

  async create(createBusDto: CreateBusDto): Promise<Bus> {
    const { companyId, ...busData } = createBusDto;
    const bus = this.busRepository.create(busData);
    if (companyId) {
      bus.company = { id: companyId } as any;
    }
    return await this.busRepository.save(bus);
  }

  async findAll(companyId?: number): Promise<Bus[]> {
    if (companyId) {
      return await this.busRepository.find({
        where: { company: { id: companyId } },
        relations: ['company']
      });
    }
    return await this.busRepository.find({ relations: ['company'] });
  }

  async findOne(id: number): Promise<Bus> {
    const bus = await this.busRepository.findOne({ where: { id } });
    if (!bus) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }
    return bus;
  }

  async update(id: number, updateBusDto: UpdateBusDto): Promise<Bus> {
    await this.findOne(id);
    await this.busRepository.update(id, updateBusDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const bus = await this.findOne(id);
    await this.busRepository.remove(bus);
  }
}
