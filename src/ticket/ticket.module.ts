import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { Ticket } from './entities/ticket.entity';
import { Programming } from '../programming/entities/programming.entity';
import { CitizenPaymentMethod } from '../citizen_payment_method/entities/citizen_payment_method.entity';
import { ValidationRecord } from '../record/entities/record.entity';
import { PaymentMethod } from '../payment_method/entities/payment_method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Programming, CitizenPaymentMethod, ValidationRecord, PaymentMethod])],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
