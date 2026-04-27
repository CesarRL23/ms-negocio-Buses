import { PartialType } from '@nestjs/mapped-types';
import { CreateProgrammingDto } from './create-programming.dto';

export class UpdateProgrammingDto extends PartialType(CreateProgrammingDto) {}
