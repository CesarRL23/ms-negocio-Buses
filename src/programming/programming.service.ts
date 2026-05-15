import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Programming } from './entities/programming.entity';
import { CreateProgrammingDto } from './dto/create-programming.dto';
import { UpdateProgrammingDto } from './dto/update-programming.dto';
import { Shift } from '../shift/entities/shift.entity';

@Injectable()
export class ProgrammingService {
  constructor(
    @InjectRepository(Programming)
    private readonly programmingRepository: Repository<Programming>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async create(
    createProgrammingDto: CreateProgrammingDto,
  ): Promise<Programming> {
    const parsedDate = new Date(createProgrammingDto.fecha + 'T00:00:00Z');

    // 1. Validar que el bus no tenga otra programación en el mismo horario
    const existingProgramming = await this.programmingRepository.findOne({
      where: {
        bus: { id: createProgrammingDto.busId },
        fecha: parsedDate,
        horaSalida: createProgrammingDto.horaSalida,
        activo: true
      }
    });

    if (existingProgramming) {
      throw new BadRequestException('El bus ya tiene una programación activa en este mismo horario.');
    }

    // 2. Validar que el conductor no tenga otro turno en la misma fecha (opcional, pero ayuda a evitar cruces)
    const existingShift = await this.shiftRepository.findOne({
      where: {
        driver: { id: createProgrammingDto.driverId },
        fecha: parsedDate
      }
    });

    if (existingShift) {
      throw new BadRequestException('El conductor ya tiene un turno asignado para esta fecha.');
    }

    try {
      const programming = this.programmingRepository.create({
        ...createProgrammingDto,
        fecha: parsedDate,
        route: { id: createProgrammingDto.routeId },
        bus: { id: createProgrammingDto.busId },
        driver: { id: createProgrammingDto.driverId }
      });
      const savedProgramming = await this.programmingRepository.save(programming);

      // Crear el Turno automáticamente
      const shiftTime = new Date(`${createProgrammingDto.fecha}T${createProgrammingDto.horaSalida}:00`);
      const shift = this.shiftRepository.create({
        fecha: parsedDate,
        hora_inicio: shiftTime,
        estado: 'PROGRAMADO',
        bus: { id: createProgrammingDto.busId },
        driver: { id: createProgrammingDto.driverId }
      });
      await this.shiftRepository.save(shift);

      return savedProgramming;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(
        'Error al crear la programación: ' + errorMessage,
      );
    }
  }

  async findAll(): Promise<Programming[]> {
    return await this.programmingRepository.find({
      relations: ['route', 'bus'],
    });
  }

  async findOne(id: number): Promise<Programming> {
    const programming = await this.programmingRepository.findOne({
      where: { id },
      relations: ['route', 'bus'],
    });

    if (!programming) {
      throw new NotFoundException(`Programación con ID ${id} no encontrada`);
    }

    return programming;
  }

  async update(
    id: number,
    updateProgrammingDto: UpdateProgrammingDto,
  ): Promise<Programming> {
    const programming = await this.findOne(id);

    Object.assign(programming, updateProgrammingDto);

    try {
      return await this.programmingRepository.save(programming);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(
        'Error al actualizar la programación: ' + errorMessage,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const programming = await this.findOne(id);

    try {
      await this.programmingRepository.remove(programming);
      return { message: `Programación con ID ${id} eliminada correctamente` };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(
        'Error al eliminar la programación: ' + errorMessage,
      );
    }
  }
}
