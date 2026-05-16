import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Programming } from '../programming/entities/programming.entity';
import { CitizenPaymentMethod } from '../citizen_payment_method/entities/citizen_payment_method.entity';
import { PaymentMethod } from '../payment_method/entities/payment_method.entity';
import { ValidationRecord } from '../record/entities/record.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Programming)
    private readonly programmingRepository: Repository<Programming>,
    @InjectRepository(CitizenPaymentMethod)
    private readonly cpmRepository: Repository<CitizenPaymentMethod>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(ValidationRecord)
    private readonly recordRepository: Repository<ValidationRecord>,
  ) { }

  async board(data: { programmingId: number; citizenPaymentMethodId: number; nodoId: number }) {
    const { programmingId, citizenPaymentMethodId, nodoId } = data;

    // 1. Identificar la programación y el bus
    const programming = await this.programmingRepository.findOne({
      where: { id: programmingId },
      relations: ['bus']
    });
    if (!programming) throw new NotFoundException('Programación no encontrada');

    // 2. Verificar la capacidad
    const capacity = programming.bus?.capacidad || 40;
    const activeTicketsCount = await this.ticketRepository.count({
      where: { programming: { id: programmingId }, estado: 'ACTIVO' }
    });
    if (activeTicketsCount >= capacity) {
      throw new BadRequestException('El bus está lleno (capacidad máxima alcanzada)');
    }

    // 3. Validar el saldo del método de pago
    const cpm = await this.cpmRepository.findOne({
      where: { id: citizenPaymentMethodId },
      relations: ['paymentMethod']
    });
    if (!cpm || !cpm.paymentMethod) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    const TARIFA = 3000; // Tarifa estándar
    const saldo = Number(cpm.paymentMethod.saldo || 0);

    // Para simplificar, descontamos asumiendo que todo saldo se puede restar si no es efectivo, o simplemente lo descontamos siempre
    if (saldo < TARIFA) {
      throw new BadRequestException('Saldo insuficiente para abordar');
    }

    // Descontar saldo
    cpm.paymentMethod.saldo = saldo - TARIFA;
    await this.paymentMethodRepository.save(cpm.paymentMethod);

    // 4. Generar el boleto
    const ticket = this.ticketRepository.create({
      codigo: `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      precio: TARIFA,
      fechaCompra: new Date(),
      estado: 'ACTIVO',
      metodoPago: cpm.paymentMethod.type,
      citizenPaymentMethod: { id: citizenPaymentMethodId },
      programming: { id: programmingId }
    });
    const savedTicket = await this.ticketRepository.save(ticket);

    // 5. Registrar validación de abordaje
    const record = this.recordRepository.create({
      ticket: { id: savedTicket.id },
      nodo: { id: nodoId },
      timestamp: new Date(),
      type: 'ABORDAJE'
    });
    await this.recordRepository.save(record);

    return {
      message: 'Abordaje exitoso',
      saldoRestante: cpm.paymentMethod.saldo,
      ticket: savedTicket
    };
  }

  async alight(data: { ticketId: number; nodoId: number }) {
    const { ticketId, nodoId } = data;

    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Boleto no encontrado');

    if (ticket.estado !== 'ACTIVO') {
      throw new BadRequestException('El boleto no está activo');
    }

    // 1. Registrar validación de descenso
    const record = this.recordRepository.create({
      ticket: { id: ticket.id },
      nodo: { id: nodoId },
      timestamp: new Date(),
      type: 'DESCENSO'
    });
    await this.recordRepository.save(record);

    // 2. Actualizar estado del boleto
    ticket.estado = 'COMPLETADO';
    ticket.FechaUso = new Date(); // Usado/finalizado
    await this.ticketRepository.save(ticket);

    return {
      message: 'Viaje completado - Gracias por usar nuestro servicio',
      ticket
    };
  }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create(createTicketDto);
    return await this.ticketRepository.save(ticket);
  }

  async findAll(): Promise<Ticket[]> {
    return await this.ticketRepository.find({
      relations: ['programming'],
    });
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['programming'],
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async getTripDetails(ticketId: number) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: [
        'programming',
        'programming.bus',
        'programming.driver',
        'programming.driver.person',
        'programming.route',
        'programming.route.nodos',
        'programming.route.nodos.stop',
        'validationRecords',
        'validationRecords.nodo',
        'validationRecords.nodo.stop'
      ]
    });

    if (!ticket) throw new NotFoundException('Viaje no encontrado');

    const abordaje = ticket.validationRecords?.find(r => r.type === 'ABORDAJE');
    const descenso = ticket.validationRecords?.find(r => r.type === 'DESCENSO');

    let tiempoTotalMinutos = 0;
    if (abordaje && descenso && abordaje.timestamp && descenso.timestamp) {
      const ms = new Date(descenso.timestamp).getTime() - new Date(abordaje.timestamp).getTime();
      tiempoTotalMinutos = Math.round(ms / 60000);
    }

    return {
      ticketInfo: {
        id: ticket.id,
        codigo: ticket.codigo,
        estado: ticket.estado,
        precio: ticket.precio,
        fechaCompra: ticket.fechaCompra,
      },
      bus: ticket.programming?.bus,
      conductor: ticket.programming?.driver?.person,
      ruta: ticket.programming?.route,
      validaciones: {
        abordaje: abordaje || null,
        descenso: descenso || null,
      },
      tiempoTotalMinutos
    };
  }

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    await this.findOne(id);
    await this.ticketRepository.update(id, updateTicketDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
  }
}
