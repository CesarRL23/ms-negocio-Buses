import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Whereabouts } from './entities/whereabout.entity';
import { CreateWhereaboutDto } from './dto/create-whereabout.dto';
import { UpdateWhereaboutDto } from './dto/update-whereabout.dto';

@Injectable()
export class WhereaboutsService {
  constructor(
    @InjectRepository(Whereabouts)
    private readonly whereaboutsRepository: Repository<Whereabouts>,
  ) {}

  async create(createWhereaboutDto: CreateWhereaboutDto): Promise<Whereabouts> {
    try {
      const whereabout = this.whereaboutsRepository.create(createWhereaboutDto);
      return await this.whereaboutsRepository.save(whereabout);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al crear el punto de referencia: ' + errorMessage);
    }
  }

  async findAll(): Promise<Whereabouts[]> {
    return await this.whereaboutsRepository.find();
  }

  async findOne(id: number): Promise<Whereabouts> {
    const whereabout = await this.whereaboutsRepository.findOne({ where: { id } });

    if (!whereabout) {
      throw new NotFoundException(`Punto de referencia con ID ${id} no encontrado`);
    }

    return whereabout;
  }

  async update(id: number, updateWhereaboutDto: UpdateWhereaboutDto): Promise<Whereabouts> {
    const whereabout = await this.findOne(id);

    Object.assign(whereabout, updateWhereaboutDto);

    try {
      return await this.whereaboutsRepository.save(whereabout);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al actualizar el punto de referencia: ' + errorMessage);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const whereabout = await this.findOne(id);

    try {
      await this.whereaboutsRepository.remove(whereabout);
      return { message: `Punto de referencia con ID ${id} eliminado correctamente` };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al eliminar el punto de referencia: ' + errorMessage);
    }
  }
}
