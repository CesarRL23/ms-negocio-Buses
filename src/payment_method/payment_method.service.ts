import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentMethodDto } from './dto/create-payment_method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment_method.dto';
import { PaymentMethod } from './entities/payment_method.entity';
import axios from 'axios';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto) {
    const paymentMethod = this.paymentMethodRepository.create(
      createPaymentMethodDto,
    );
    return await this.paymentMethodRepository.save(paymentMethod);
  }

  async findAll() {
    return await this.paymentMethodRepository.find();
  }

  async findOne(id: number) {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id },
    });
    if (!paymentMethod) {
      throw new NotFoundException(`PaymentMethod con id ${id} no encontrado`);
    }
    return paymentMethod;
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    await this.findOne(id);
    await this.paymentMethodRepository.update(id, updatePaymentMethodDto);
    return await this.findOne(id);
  }

  async recharge(id: number, amount: number) {
    const paymentMethod = await this.findOne(id);
    paymentMethod.saldo = Number(paymentMethod.saldo) + Number(amount);
    return await this.paymentMethodRepository.save(paymentMethod);
  }

  async processEpaycoRecharge(refPayco: string) {
    try {
      const response = await axios.get(
        `https://secure.epayco.co/validation/v1/reference/${refPayco}`,
      );
      if (!response.data || !response.data.success) {
        throw new BadRequestException(
          'No se pudo validar la transacción con ePayco',
        );
      }

      const txData = response.data.data;
      const state = txData.x_transaction_state || txData.x_response;
      const amount = Number(txData.x_amount);
      const paymentMethodId = Number(txData.x_extra1);

      if (state !== 'Aceptada' && state !== 'Aprobada') {
        throw new BadRequestException(
          `La transacción no está aprobada. Estado de la pasarela: ${state}`,
        );
      }

      if (!paymentMethodId) {
        throw new BadRequestException(
          'ID de método de pago no especificado en los metadatos de ePayco (x_extra1)',
        );
      }

      return await this.recharge(paymentMethodId, amount);
    } catch (error) {
      throw new BadRequestException(
        `Error al validar pago con ePayco: ${error.message}`,
      );
    }
  }

  async remove(id: number) {
    const paymentMethod = await this.findOne(id);
    await this.paymentMethodRepository.delete(id);
    return paymentMethod;
  }
}
