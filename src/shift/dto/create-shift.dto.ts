import { IsNotEmpty, IsDate, IsString, IsNumber } from "class-validator";

export class CreateShiftDto {
    @IsNotEmpty()
    @IsDate()
    fecha?: Date;

    @IsNotEmpty()
    @IsDate()
    hora_inicio?: Date;

    @IsNotEmpty()
    @IsDate()
    hora_fin?: Date;

    @IsNotEmpty()
    @IsString()
    estado?: string;

    @IsNotEmpty()
    @IsNumber()
    driver_id?: number;

    @IsNotEmpty()
    @IsNumber()
    bus_id?: number;
}
