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
      const { companyId, ...routeData } = createRouteDto;
      const route = this.routeRepository.create(routeData);
      if (companyId) {
        route.company = { id: companyId } as any;
      }
      return await this.routeRepository.save(route);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al crear la ruta: ' + message);
    }
  }

  async findAll(companyId?: number): Promise<Route[]> {
    const where = companyId ? { company: { id: companyId } } : {};
    return await this.routeRepository.find({
      where,
      relations: ['nodos', 'nodos.stop', 'company'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Route> {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['nodos', 'nodos.stop'],
    });
    if (!route) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }
    return route;
  }

  async findNodosByRoute(routeId: number): Promise<any> {
    const route = await this.routeRepository.findOne({
      where: { id: routeId },
      relations: ['nodos', 'nodos.stop'],
    });
    if (!route) {
      throw new NotFoundException(`Ruta con ID ${routeId} no encontrada`);
    }
    const nodosSorted = (route.nodos || []).sort((a, b) => (a.orden || 0) - (b.orden || 0));
    return {
      route: {
        id: route.id,
        nombre: route.nombre,
        descripcion: route.descripcion,
        origen: route.origen,
        destino: route.destino,
        distancia: route.distancia,
        duracion_estimada: route.duracion_estimada,
        tarifa: route.tarifa,
      },
      nodos: nodosSorted,
    };
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
