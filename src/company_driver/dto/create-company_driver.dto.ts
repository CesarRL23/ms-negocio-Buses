import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateCompanyDriverDto {

    @IsNotEmpty()
    @IsNumber()
    companyId?: number;

    @IsNotEmpty()
    @IsNumber()
    driverId?: number;

}
