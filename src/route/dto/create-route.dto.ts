import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRouteDto {
    @IsNotEmpty({ message: 'El nombre de la ruta es requerido' })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    nombre?: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    descripcion?: string;

    @IsNotEmpty({ message: 'El origen es requerido' })
    @IsString({ message: 'El origen debe ser una cadena de texto' })
    origen?: string;

    @IsNotEmpty({ message: 'El destino es requerido' })
    @IsString({ message: 'El destino debe ser una cadena de texto' })
    destino?: string;

    @IsNotEmpty({ message: 'La distancia es requerida' })
    @IsNumber({}, { message: 'La distancia debe ser un número' })
    distancia?: number;
    
    @IsNotEmpty({ message: 'La duración estimada es requerida' })
    @IsNumber({}, { message: 'La duración estimada debe ser un número' })
    duracion_estimada?: number;

    @IsOptional()
    @IsNumber({}, { message: 'La tarifa debe ser un número' })
    tarifa?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El ID de la empresa debe ser un número' })
    companyId?: number;
}
