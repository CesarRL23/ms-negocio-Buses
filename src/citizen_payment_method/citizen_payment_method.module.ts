import { Module } from '@nestjs/common';
import { CitizenPaymentMethodService } from './citizen_payment_method.service';
import { CitizenPaymentMethodController } from './citizen_payment_method.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitizenPaymentMethod } from './entities/citizen_payment_method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CitizenPaymentMethod])],
  controllers: [CitizenPaymentMethodController],
  providers: [CitizenPaymentMethodService],
})
export class CitizenPaymentMethodModule {}
