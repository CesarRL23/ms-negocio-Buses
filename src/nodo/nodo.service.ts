import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nodo } from './entities/nodo.entity';
import { CreateNodoDto } from './dto/create-nodo.dto';
import { UpdateNodoDto } from './dto/update-nodo.dto';

@Injectable()
export class NodoService {
  constructor(
    @InjectRepository(Nodo)
    private readonly nodoRepository: Repository<Nodo>,
  ) {}

  async create(createNodoDto: CreateNodoDto): Promise<Nodo> {
    try {
      const nodo = this.nodoRepository.create(createNodoDto);
      return await this.nodoRepository.save(nodo);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al crear el nodo: ' + errorMessage);
    }
  }

  async findAll(): Promise<Nodo[]> {
    return await this.nodoRepository.find({
      relations: ['stop', 'route'],
    });
  }

  async findOne(id: number): Promise<Nodo> {
    const nodo = await this.nodoRepository.findOne({
      where: { id },
      relations: ['stop', 'route'],
    });

    if (!nodo) {
      throw new NotFoundException(`Nodo con ID ${id} no encontrado`);
    }

    return nodo;
  }

  async update(id: number, updateNodoDto: UpdateNodoDto): Promise<Nodo> {
    const nodo = await this.findOne(id);

    Object.assign(nodo, updateNodoDto);

    try {
      return await this.nodoRepository.save(nodo);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al actualizar el nodo: ' + errorMessage);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const nodo = await this.findOne(id);

    try {
      await this.nodoRepository.remove(nodo);
      return { message: `Nodo con ID ${id} eliminado correctamente` };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al eliminar el nodo: ' + errorMessage);
    }
  }
}
