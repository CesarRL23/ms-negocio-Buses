import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Route } from './entities/route.entity';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    try {
      const route = this.routeRepository.create(createRouteDto);
      return await this.routeRepository.save(route);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al crear la ruta: ' + message);
    }
  }

  async findAll(): Promise<Route[]> {
    return await this.routeRepository.find();
  }

  async findOne(id: number): Promise<Route> {
    const route = await this.routeRepository.findOne({ where: { id } });
    if (!route) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }
    return route;
  }

  async update(id: number, updateRouteDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);
    Object.assign(route, updateRouteDto);
    try {
      return await this.routeRepository.save(route);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al actualizar la ruta: ' + message);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const route = await this.findOne(id);
    await this.routeRepository.remove(route);
    return { message: `Ruta con ID ${id} eliminada exitosamente` };
  }
}
