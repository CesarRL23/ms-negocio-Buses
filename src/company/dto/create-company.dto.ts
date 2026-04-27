

import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateCompanyDto {
    @IsString()
    name?: string;

    @IsString()
    address?: string;

    @IsEmail()
    email?: string;

    @IsString()
    nit?: string;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
