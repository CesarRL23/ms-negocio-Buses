import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonGroupDto } from './create-person-group.dto';

export class UpdatePersonGroupDto extends PartialType(CreatePersonGroupDto) {}
