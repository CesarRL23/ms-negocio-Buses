import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCitizenPaymentMethodDto {
  @IsNotEmpty()
  @IsNumber()
  citizenId?: number;

  @IsNotEmpty()
  @IsNumber()
  paymentMethodId?: number;
}
