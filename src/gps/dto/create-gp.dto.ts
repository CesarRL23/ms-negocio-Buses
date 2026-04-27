import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateGpsDto {

    @IsNotEmpty()
    @IsString()
    codigo!: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    latitud!: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    longitud!: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    busId!: number;
}