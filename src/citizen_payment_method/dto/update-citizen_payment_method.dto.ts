import { PartialType } from '@nestjs/mapped-types';
import { CreateCitizenPaymentMethodDto } from './create-citizen_payment_method.dto';

export class UpdateCitizenPaymentMethodDto extends PartialType(CreateCitizenPaymentMethodDto) {}
