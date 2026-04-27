import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";


export class CreateWhereaboutDto {
    
    @IsNotEmpty()
    @IsString()
    nombre?: string;

    @IsNotEmpty()
    @IsNumber()
    latitud?: number;

    @IsNotEmpty()
    @IsNumber()
    longitud?: number;

    @IsNotEmpty()
    @IsString()
    direccion?: string;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;

}
