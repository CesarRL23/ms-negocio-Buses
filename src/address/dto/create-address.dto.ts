import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAddressDto {

    @IsNotEmpty()
    @IsString()
    street?: string; //calle

    @IsNotEmpty()
    @IsString()
    number?: string; // Número (ej: #45-23)  

    @IsNotEmpty()
    @IsString()
    neighborhood?: string; // Barrio

    @IsNotEmpty()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    additionalInfo?: string; // Apto, torre, etc


}
