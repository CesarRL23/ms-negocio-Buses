import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidationRecord } from './entities/record.entity';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(ValidationRecord)
    private readonly recordRepository: Repository<ValidationRecord>,
  ) {}

  async create(createRecordDto: CreateRecordDto): Promise<ValidationRecord> {
    const record = this.recordRepository.create(createRecordDto);
    return await this.recordRepository.save(record);
  }

  async findAll(): Promise<ValidationRecord[]> {
    return await this.recordRepository.find({
      relations: ['ticket', 'nodo'],
    });
  }

  async findOne(id: number): Promise<ValidationRecord> {
    const record = await this.recordRepository.findOne({
      where: { id },
      relations: ['ticket', 'nodo'],
    });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return record;
  }

  async update(id: number, updateRecordDto: UpdateRecordDto): Promise<ValidationRecord> {
    await this.findOne(id);
    await this.recordRepository.update(id, updateRecordDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await this.recordRepository.remove(record);
  }
}
