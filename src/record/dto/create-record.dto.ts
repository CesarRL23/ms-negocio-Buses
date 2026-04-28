import { IsNotEmpty, IsNumber, IsString, IsDate } from "class-validator";
import { Type } from "class-transformer";

export class CreateRecordDto {
    @IsNotEmpty()
    @IsNumber()
    ticketId?: number;

    @IsNotEmpty()
    @IsNumber()
    nodoId?: number;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    timestamp?: Date;

    @IsNotEmpty()
    @IsString()
    type?: string; // BOARDING | ALIGHTING
}
