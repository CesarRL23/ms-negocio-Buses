import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async create(createShiftDto: CreateShiftDto): Promise<Shift> {
    const shift = this.shiftRepository.create(createShiftDto);
    return await this.shiftRepository.save(shift);
  }

  async findAll(): Promise<Shift[]> {
    return await this.shiftRepository.find({
      relations: ['driver', 'bus'],
    });
  }

  async findOne(id: number): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({
      where: { id },
      relations: ['driver', 'bus'],
    });
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return shift;
  }

  async update(id: number, updateShiftDto: UpdateShiftDto): Promise<Shift> {
    await this.findOne(id);
    await this.shiftRepository.update(id, updateShiftDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const shift = await this.findOne(id);
    await this.shiftRepository.remove(shift);
  }

  async startShift(id: number, data: { estado_bus: boolean; observaciones_bus?: string }): Promise<Shift> {
    const shift = await this.findOne(id);
    
    if (shift.estado === 'EN CURSO') {
      throw new BadRequestException('El turno ya está en curso');
    }
    
    shift.estado = 'EN CURSO';
    shift.estado_bus = data.estado_bus;
    shift.observaciones_bus = data.observaciones_bus;
    shift.hora_inicio_real = new Date();
    
    return await this.shiftRepository.save(shift);
  }
}
