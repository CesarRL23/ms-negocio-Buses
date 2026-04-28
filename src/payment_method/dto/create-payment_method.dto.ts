import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreatePaymentMethodDto {

    @IsNotEmpty()
    @IsString()
    type?: string; // CARD | CASH | APP

    @IsNotEmpty()
    @IsString()
    provider?: string; // VISA, MASTERCARD, NEQUI, DAVIPLATA

    @IsNotEmpty()
    @IsString()
    accountNumber?: string; // número tarjeta o celular

    @IsNotEmpty()
    @IsBoolean()
    isActive?: boolean;
}
