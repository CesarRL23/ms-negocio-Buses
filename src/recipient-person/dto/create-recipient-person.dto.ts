import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRecipientPersonDto {
    @IsNotEmpty()
    @IsNumber()
    message_id: number;

    @IsNotEmpty()
    @IsNumber()
    person_id: number;
}
