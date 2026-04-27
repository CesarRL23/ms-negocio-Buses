import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Programming } from './entities/programming.entity';
import { CreateProgrammingDto } from './dto/create-programming.dto';
import { UpdateProgrammingDto } from './dto/update-programming.dto';

@Injectable()
export class ProgrammingService {
  constructor(
    @InjectRepository(Programming)
    private readonly programmingRepository: Repository<Programming>,
  ) {}

  async create(createProgrammingDto: CreateProgrammingDto): Promise<Programming> {
    try {
      const programming = this.programmingRepository.create(createProgrammingDto);
      return await this.programmingRepository.save(programming);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al crear la programación: ' + errorMessage);
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

  async update(id: number, updateProgrammingDto: UpdateProgrammingDto): Promise<Programming> {
    const programming = await this.findOne(id);

    Object.assign(programming, updateProgrammingDto);

    try {
      return await this.programmingRepository.save(programming);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al actualizar la programación: ' + errorMessage);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const programming = await this.findOne(id);

    try {
      await this.programmingRepository.remove(programming);
      return { message: `Programación con ID ${id} eliminada correctamente` };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al eliminar la programación: ' + errorMessage);
    }
  }
}
