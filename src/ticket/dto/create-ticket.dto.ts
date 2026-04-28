import { IsNotEmpty, IsNumber, IsString, IsDate, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateTicketDto {
    @IsNotEmpty()
    @IsString()
    codigo?: string;

    @IsNotEmpty()
    @IsNumber()
    precio?: number;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    fechaCompra?: Date;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    FechaUso?: Date;

    @IsNotEmpty()
    @IsString()
    estado?: string;

    @IsNotEmpty()
    @IsString()
    metodoPago?: string;

    @IsOptional()
    @IsNumber()
    programmingId?: number;
}
